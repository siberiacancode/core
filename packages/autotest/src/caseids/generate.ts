import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, relative, resolve, sep } from 'node:path';
import { format, resolveConfig } from 'prettier';
import ts from 'typescript';

export const DEFAULT_CASE_IDS_INPUT = 'tests/testcases';
export const DEFAULT_CASE_IDS_OUTPUT = 'tests/case-ids.ts';
export const DEFAULT_CASE_IDS_REFERENCES = 'tests';
export const DEFAULT_CASE_IDS_EXCLUDE = ['regress'] as const;
export const DEFAULT_CASE_IDS_FUNCTION_NAME = 'createTestCases';
export const DEFAULT_CASE_IDS_NAME = 'CASE_IDS';
export const DEFAULT_CASE_IDS_LAST_ID_NAME = 'LAST_CASE_ID';

interface Replacement {
  end: number;
  start: number;
  text: string;
}

interface SourceFile {
  file: string;
  source: string;
  sourceFile: ts.SourceFile;
}

export interface GenerateCaseIdsOptions {
  /** @default 'CASE_IDS' */
  constantName?: string;
  /** @default process.cwd() */
  cwd?: string;
  /** @default ['regress'] */
  exclude?: string[];
  /** @default 'createTestCases' */
  functionName?: string;
  /** @default 'tests/testcases' */
  input?: string;
  /** @default 'LAST_CASE_ID' */
  lastIdName?: string;
  /** @default 'tests/case-ids.ts' */
  output?: string;
  /** @default 'tests' */
  references?: string;
  /** @default true */
  updateReferences?: boolean;
}

export interface GenerateCaseIdsResult {
  caseCount: number;
  changedFiles: string[];
  lastId: number;
  output: string;
}

const TRANSLITERATION: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya'
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const slugify = (value: string) =>
  [...value.toLowerCase()]
    .map((symbol) => TRANSLITERATION[symbol] ?? symbol)
    .join('')
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const toConstantKey = (value: string) => {
  const key = value.replaceAll('-', '_').toUpperCase();
  return /^\d/.test(key) ? `_${key}` : key;
};

const exists = async (path: string) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const isInside = (path: string, directory: string) => {
  const child = relative(directory, path);
  return child === '' || (!child.startsWith(`..${sep}`) && child !== '..');
};

const getTypeScriptFiles = async (directory: string, excluded: string[] = []): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const sortedEntries = entries.sort((left, right) => left.name.localeCompare(right.name));
  const files: string[] = [];

  for (const entry of sortedEntries) {
    const entryPath = resolve(directory, entry.name);

    if (excluded.some((excludedPath) => isInside(entryPath, excludedPath))) continue;

    if (entry.isDirectory()) {
      files.push(...(await getTypeScriptFiles(entryPath, excluded)));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!['.ts', '.tsx'].includes(extname(entry.name))) continue;
    if (entry.name.endsWith('.d.ts')) continue;

    files.push(entryPath);
  }

  return files;
};

const getProperty = (node: ts.ObjectLiteralExpression, name: string, sourceFile: ts.SourceFile) =>
  node.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) && property.name.getText(sourceFile).replaceAll(/["']/g, '') === name
  );

const getStringValue = (expression: ts.Expression) => {
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text;
  }

  return undefined;
};

const isFactoryCall = (
  node: ts.ObjectLiteralExpression,
  functionName: string
): node is ts.ObjectLiteralExpression & {
  parent: ts.ArrayLiteralExpression & { parent: ts.CallExpression };
} => {
  if (!ts.isArrayLiteralExpression(node.parent)) return false;
  if (!ts.isCallExpression(node.parent.parent)) return false;

  const expression = node.parent.parent.expression;
  if (ts.isIdentifier(expression)) return expression.text === functionName;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text === functionName;

  return false;
};

const parseCurrentId = (source: string, constantName: string) => {
  if (/^["']?\d+["']?$/.test(source)) {
    return { numericId: Number(source.replaceAll(/["']/g, '')) };
  }

  const reference = source.match(
    new RegExp(`^${escapeRegExp(constantName)}\\.([A-Z0-9_]+)$`)
  )?.[1];

  return { key: reference };
};

const validateIdentifier = (value: string, option: string) => {
  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    false,
    ts.LanguageVariant.Standard,
    value
  );
  const token = scanner.scan();

  if (token === ts.SyntaxKind.Identifier && scanner.scan() === ts.SyntaxKind.EndOfFileToken) return;
  throw new Error(`${option} must be a valid JavaScript identifier, received "${value}"`);
};

const buildOutput = async (
  entries: Map<string, number>,
  output: string,
  constantName: string,
  lastIdName: string,
  lastId: number
) => {
  const values = [...entries]
    .sort(([, left], [, right]) => left - right)
    .map(([key, value]) => `  ${key}: '${value}',`)
    .join('\n');
  const source = `/* eslint-disable */
// generated by @siberiacancode/autotest

export const ${constantName} = {
${values}
} as const;

export const ${lastIdName} = ${lastId};
`;
  const config = (await resolveConfig(output)) ?? {};

  return format(source, { ...config, filepath: output });
};

const updateSource = (source: string, replacements: Replacement[]) => {
  let updated = source;

  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    updated = `${updated.slice(0, replacement.start)}${replacement.text}${updated.slice(replacement.end)}`;
  }

  return updated;
};

const readSourceFile = async (file: string): Promise<SourceFile> => {
  const source = await readFile(file, 'utf8');
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  return { file, source, sourceFile };
};

const collectNumericIds = (
  files: SourceFile[],
  functionName: string,
  constantName: string
) => {
  const ids: number[] = [];

  for (const { sourceFile } of files) {
    const visit = (node: ts.Node) => {
      if (ts.isObjectLiteralExpression(node) && isFactoryCall(node, functionName)) {
        const idProperty = getProperty(node, 'id', sourceFile);
        const idSource = idProperty?.initializer.getText(sourceFile);
        const id = idSource ? parseCurrentId(idSource, constantName).numericId : undefined;

        if (id !== undefined) ids.push(id);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  return ids;
};

export const generateCaseIds = async (
  options: GenerateCaseIdsOptions = {}
): Promise<GenerateCaseIdsResult> => {
  const cwd = resolve(options.cwd ?? process.cwd());
  const constantName = options.constantName ?? DEFAULT_CASE_IDS_NAME;
  const functionName = options.functionName ?? DEFAULT_CASE_IDS_FUNCTION_NAME;
  const input = resolve(cwd, options.input ?? DEFAULT_CASE_IDS_INPUT);
  const lastIdName = options.lastIdName ?? DEFAULT_CASE_IDS_LAST_ID_NAME;
  const output = resolve(cwd, options.output ?? DEFAULT_CASE_IDS_OUTPUT);
  const references = resolve(cwd, options.references ?? DEFAULT_CASE_IDS_REFERENCES);
  const updateReferences = options.updateReferences ?? true;
  const excluded = (options.exclude ?? [...DEFAULT_CASE_IDS_EXCLUDE]).map((directory) =>
    resolve(input, directory)
  );

  validateIdentifier(constantName, 'constantName');
  validateIdentifier(functionName, 'functionName');
  validateIdentifier(lastIdName, 'lastIdName');

  if (!(await exists(input))) {
    throw new Error(`test cases directory does not exist: ${relative(cwd, input)}`);
  }

  const existingSource = (await readFile(output, 'utf8').catch(() => ''));
  const existingEntries = new Map(
    [...existingSource.matchAll(/^\s+([A-Z0-9_]+):\s*["']?(\d+)["']?,?$/gm)].map(
      (match) => [match[1], Number(match[2])] as const
    )
  );
  const existingKeysById = new Map(
    [...existingEntries].map(([key, value]) => [value, key] as const)
  );
  const lastIdPattern = new RegExp(
    `export\\s+const\\s+${escapeRegExp(lastIdName)}\\s*=\\s*(\\d+)`
  );
  const lastAssignedId = Number(existingSource.match(lastIdPattern)?.[1] ?? 0);
  const entries = new Map<string, number>();
  const fileChanges = new Map<string, string>();
  const renamedKeys = new Map<string, string>();
  const usedValues = new Map<number, string>();
  const sourceFiles = await Promise.all(
    (await getTypeScriptFiles(input, excluded)).map(readSourceFile)
  );
  const numericIds = collectNumericIds(sourceFiles, functionName, constantName);
  let nextId = Math.max(lastAssignedId, 0, ...existingEntries.values(), ...numericIds) + 1;

  for (const { file, source, sourceFile } of sourceFiles) {
    const replacements: Replacement[] = [];
    let hasCases = false;

    const visit = (node: ts.Node) => {
      if (!ts.isObjectLiteralExpression(node) || !isFactoryCall(node, functionName)) {
        ts.forEachChild(node, visit);
        return;
      }

      const nameProperty = getProperty(node, 'name', sourceFile);
      if (!nameProperty) {
        throw new Error(`test case has no name in ${relative(cwd, file)}`);
      }

      const name = getStringValue(nameProperty.initializer);
      if (!name) {
        throw new Error(`test case name must be a non-empty string literal in ${relative(cwd, file)}`);
      }

      hasCases = true;
      const idProperty = getProperty(node, 'id', sourceFile);
      const relativeDirectory = relative(input, dirname(file));
      const moduleName = relativeDirectory.split(sep).find(Boolean) ?? basename(file, extname(file));
      const moduleSlug = slugify(moduleName);
      const nameSlug = slugify(name);

      if (!moduleSlug || !nameSlug) {
        throw new Error(`cannot create a case ID key from ${relative(cwd, file)}: "${name}"`);
      }

      const id =
        nameSlug === moduleSlug || nameSlug.startsWith(`${moduleSlug}-`)
          ? nameSlug
          : `${moduleSlug}-${nameSlug}`;
      const key = toConstantKey(id);
      const currentIdSource = idProperty?.initializer.getText(sourceFile);
      const currentId = currentIdSource
        ? parseCurrentId(currentIdSource, constantName)
        : undefined;
      const currentKey =
        currentId?.key ??
        (currentId?.numericId === undefined
          ? undefined
          : existingKeysById.get(currentId.numericId));
      const numericId =
        currentId?.numericId ??
        (currentKey ? existingEntries.get(currentKey) : undefined) ??
        existingEntries.get(key) ??
        nextId++;
      const existingKey = usedValues.get(numericId);

      if (entries.has(key)) {
        throw new Error(`duplicate case ID key ${key} in ${relative(cwd, file)}`);
      }

      if (existingKey && existingKey !== key) {
        throw new Error(`duplicate case ID ${numericId}: ${existingKey} and ${key}`);
      }

      entries.set(key, numericId);
      usedValues.set(numericId, key);

      if (idProperty) {
        if (currentKey && currentKey !== key) renamedKeys.set(currentKey, key);

        if (currentIdSource !== `'${numericId}'`) {
          replacements.push({
            end: idProperty.initializer.end,
            start: idProperty.initializer.getStart(sourceFile),
            text: `'${numericId}'`
          });
        }
      } else {
        const nameStart = nameProperty.getStart(sourceFile);
        const linePrefix = source.slice(source.lastIndexOf('\n', nameStart) + 1, nameStart);
        const separator = /^\s*$/.test(linePrefix) ? `\n${linePrefix}` : ' ';
        replacements.push({
          end: nameStart,
          start: nameStart,
          text: `id: '${numericId}',${separator}`
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    let updatedSource = updateSource(source, replacements);
    if (hasCases && !updatedSource.includes(`${constantName}.`)) {
      const importPattern = new RegExp(
        `^import\\s*\\{\\s*${escapeRegExp(constantName)}\\s*\\}\\s*from\\s*["'][^"']+["'];?\\r?\\n`,
        'm'
      );
      updatedSource = updatedSource.replace(importPattern, '');
    }

    if (updatedSource !== source) fileChanges.set(file, updatedSource);
  }

  if (updateReferences && renamedKeys.size && (await exists(references))) {
    for (const file of await getTypeScriptFiles(references, [input])) {
      if (file === output) continue;

      const source = await readFile(file, 'utf8');
      let updatedSource = source;

      for (const [oldKey, newKey] of renamedKeys) {
        updatedSource = updatedSource.replaceAll(
          `${constantName}.${oldKey}`,
          `${constantName}.${newKey}`
        );
      }

      if (updatedSource !== source) fileChanges.set(file, updatedSource);
    }
  }

  const lastId = Math.max(lastAssignedId, 0, ...entries.values());
  const outputSource = await buildOutput(entries, output, constantName, lastIdName, lastId);
  if (outputSource !== existingSource) fileChanges.set(output, outputSource);

  for (const [file, source] of fileChanges) {
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, source, 'utf8');
  }

  return {
    caseCount: entries.size,
    changedFiles: [...fileChanges.keys()],
    lastId,
    output
  };
};
