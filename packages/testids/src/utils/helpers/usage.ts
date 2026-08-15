import { readFile } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';
import { glob } from 'tinyglobby';

import type { TestidNode } from '../../types';

import { DEFAULT_NAME } from '../constants';
import { parseSource, walkAst } from './ast';

export interface TestidUsage extends TestidNode {
  files: string[];
  status: 'unused' | 'used';
}

export const DEFAULT_GLOBS = ['**/*.{ts,tsx,js,jsx,mts,mjs,cts,cjs,vue,svelte}'];
export const DEFAULT_IGNORE = ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'];

interface UsageOptions {
  cwd?: string;
  globs?: string[];
  ignore?: string[];
  name?: string;
  /** @description generated constants file, always excluded from the scan */
  output?: string;
}

interface TestidReference {
  accessor: string;
}

const MEMBER_TYPES = new Set(['MemberExpression', 'OptionalMemberExpression']);
const PARSEABLE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mts',
  '.mjs',
  '.cts',
  '.cjs'
]);

const unwrap = (node: any): any => {
  if (!node) return node;
  if (node.type === 'ChainExpression') return unwrap(node.expression);
  if (
    node.type === 'TSAsExpression' ||
    node.type === 'TSSatisfiesExpression' ||
    node.type === 'TSNonNullExpression'
  ) {
    return unwrap(node.expression);
  }
  return node;
};

const resolveMember = (node: any, name: string): TestidReference | null => {
  const segments: string[] = [];
  let current = unwrap(node);

  while (current && MEMBER_TYPES.has(current.type)) {
    const key = current.property;
    const isStaticLiteral = key?.type === 'StringLiteral' || key?.type === 'Literal';
    const isStaticIdentifier = key?.type === 'Identifier' && !current.computed;

    if (isStaticIdentifier) {
      segments.unshift(key.name);
    } else if (isStaticLiteral && typeof key.value !== 'object') {
      segments.unshift(String(key.value));
    } else {
      segments.length = 0;
    }

    current = unwrap(current.object);
  }

  if (current?.type !== 'Identifier' || current.name !== name || !segments.length) return null;

  return { accessor: [name, ...segments].join('.') };
};

const isMemberObject = (node: any, parent: any) =>
  parent && MEMBER_TYPES.has(parent.type) && unwrap(parent.object) === node;

const extractFromAst = (source: string, filename: string, name: string) => {
  const references: TestidReference[] = [];
  const ast = parseSource(filename, source);

  walkAst(ast, (node, parent) => {
    if (!MEMBER_TYPES.has(node.type)) return;
    if (isMemberObject(node, parent)) return;

    const reference = resolveMember(node, name);
    if (reference) references.push(reference);
  });

  return references;
};

/**
 * @description fallback for framework files that contain JS/TS inside a larger file format.
 * It intentionally only recognizes TESTIDS access paths and does not try to understand
 * framework-specific test APIs or data-testid attributes.
 */
const extractFromText = (source: string, name: string) => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `\\b${escapedName}(?:(?:\\.[A-Za-z_$][\\w$]*)|(?:\\[['\"][^'\"]+['\"]\\]))+(?:\\[[^\\]]+\\])?`,
    'g'
  );

  return [...source.matchAll(pattern)].map((match) => {
    const raw = match[0];
    const accessor = raw.replace(/\[['"]([^'"]+)['"]\]/g, '.$1').replace(/\[[^\]]+\]$/, '');

    return { accessor };
  });
};

const extract = (source: string, filename: string, name: string) => {
  if (!PARSEABLE_EXTENSIONS.has(extname(filename))) return extractFromText(source, name);
  return extractFromAst(source, filename, name);
};

const touches = (node: TestidNode, references: TestidReference[]) =>
  references.some((reference) => {
    if (node.accessor === reference.accessor) return true;

    // Parent access (`TESTIDS.form`) and dynamic access (`TESTIDS.form[name]`)
    // conservatively mark every leaf below that branch as used.
    return node.accessor.startsWith(`${reference.accessor}.`);
  });

export const collectUsage = async (
  nodes: TestidNode[],
  options: UsageOptions = {}
): Promise<TestidUsage[]> => {
  const cwd = options.cwd ?? process.cwd();
  const name = options.name ?? DEFAULT_NAME;
  const ignore = [...DEFAULT_IGNORE, ...(options.ignore ?? [])];

  if (options.output) ignore.push(relative(cwd, resolve(cwd, options.output)));

  const files = await glob(options.globs ?? DEFAULT_GLOBS, { cwd, ignore, absolute: false });
  const usage = new Map<string, TestidUsage>(
    nodes.map((node) => [node.id, { ...node, files: [], status: 'unused' }])
  );

  await Promise.all(
    files.map(async (file) => {
      const source = await readFile(resolve(cwd, file), 'utf8').catch(() => null);
      if (!source || !source.includes(name)) return;

      const references = extract(source, file, name);
      if (!references.length) return;

      nodes.forEach((node) => {
        if (touches(node, references)) usage.get(node.id)!.files.push(file);
      });
    })
  );

  return [...usage.values()].map((entry) => ({
    ...entry,
    files: [...entry.files].sort(),
    status: entry.files.length ? 'used' : 'unused'
  }));
};
