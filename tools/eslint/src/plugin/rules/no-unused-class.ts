import type { Rule } from 'eslint';
import type * as ESTree from 'estree';

import fs from 'node:fs';
import path from 'node:path';

type CamelCaseOption = 'dashes-only' | 'dashes' | 'only' | true;

interface RuleOptions {
  camelCase?: CamelCaseOption;
  markAsUsed?: string[];
}

interface StyleImportMapValue {
  classes: Record<string, boolean>;
  classesMap: Record<string, string>;
  filePath: string;
  node: ESTree.Node;
}

const STYLE_IMPORT_REGEXP = /\.(?:css|scss|less)$/u;

const toCamelCase = (value: string): string =>
  value.replace(/-([a-z])/gu, (_substring, letter: string) => letter.toUpperCase());

const extractClassNames = (source: string): string[] => {
  const classNames = new Set<string>();
  const classNameRegExp = /\.([_a-zA-Z][\w-]*)/gu;

  let match = classNameRegExp.exec(source);
  while (match !== null) {
    const className = match[1];
    if (className !== undefined && className !== '') classNames.add(className);
    match = classNameRegExp.exec(source);
  }

  return [...classNames];
};

const buildClassesMap = (
  classNames: string[],
  camelCaseOption: CamelCaseOption | undefined
): Record<string, string> => {
  const onlyCamelCase = camelCaseOption === 'only' || camelCaseOption === 'dashes-only';
  const withCamelCase = camelCaseOption === true || camelCaseOption === 'dashes' || onlyCamelCase;
  const classesMap: Record<string, string> = {};

  classNames.forEach((className) => {
    if (!onlyCamelCase) classesMap[className] = className;
    if (withCamelCase) classesMap[toCamelCase(className)] = className;
  });

  return classesMap;
};

const getStyleImportData = (
  node: ESTree.ImportDeclaration
):
  | {
      importName: string;
      styleFilePath: string;
      importNode: ESTree.Node;
    }
  | undefined => {
  if (node.source.type !== 'Literal' || typeof node.source.value !== 'string') return undefined;
  const source = node.source.value;
  if (!STYLE_IMPORT_REGEXP.test(source)) return undefined;

  const importSpecifier = node.specifiers.find(
    (specifier) =>
      specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier'
  );

  if (importSpecifier === undefined) return undefined;

  return {
    importName: importSpecifier.local.name,
    importNode: importSpecifier,
    styleFilePath: source
  };
};

const getPropertyName = (
  node: ESTree.MemberExpression,
  camelCaseOption: CamelCaseOption | undefined
): string | undefined => {
  if (node.computed === false && node.property.type === 'Identifier') return node.property.name;

  if (node.computed === true && node.property.type === 'Literal') {
    if (typeof node.property.value !== 'string' || node.property.value === '') return undefined;
    return camelCaseOption === 'only' ? toCamelCase(node.property.value) : node.property.value;
  }

  if (
    node.computed === true &&
    node.property.type === 'TemplateLiteral' &&
    node.property.expressions.length === 0
  ) {
    const value = node.property.quasis[0]?.value.cooked;
    if (typeof value !== 'string' || value === '') return undefined;
    return camelCaseOption === 'only' ? toCamelCase(value) : value;
  }

  return undefined;
};

const getAbsoluteStylePath = (
  context: Rule.RuleContext,
  styleFilePath: string
): string | undefined => {
  const filename = context.filename;
  if (filename === '<input>') return undefined;
  return path.resolve(path.dirname(filename), styleFilePath);
};

export const noUnusedClass: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Checks that all CSS/SCSS/LESS classes imported as modules are used'
    },
    schema: [
      {
        type: 'object',
        properties: {
          camelCase: { enum: [true, 'dashes', 'only', 'dashes-only'] },
          markAsUsed: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const options = (context.options[0] ?? {}) as RuleOptions;
    const camelCaseOption = options.camelCase;
    const markAsUsed = options.markAsUsed ?? [];
    const importMap: Record<string, StyleImportMapValue> = {};

    return {
      ImportDeclaration(node) {
        const styleImportData = getStyleImportData(node as ESTree.ImportDeclaration);
        if (styleImportData === undefined) return;

        const absoluteStylePath = getAbsoluteStylePath(context, styleImportData.styleFilePath);
        if (absoluteStylePath === undefined || !fs.existsSync(absoluteStylePath)) return;

        const stylesheetText = fs.readFileSync(absoluteStylePath, 'utf8');
        const classNames = extractClassNames(stylesheetText);
        const classes: Record<string, boolean> = {};
        classNames.forEach((className) => {
          classes[className] = false;
        });

        importMap[styleImportData.importName] = {
          classes,
          classesMap: buildClassesMap(classNames, camelCaseOption),
          filePath: styleImportData.styleFilePath,
          node: styleImportData.importNode
        };
      },
      MemberExpression(node) {
        const typedNode = node as ESTree.MemberExpression;
        if (typedNode.object.type !== 'Identifier') return;

        const entry = importMap[typedNode.object.name];
        if (entry === undefined) return;

        const propertyName = getPropertyName(typedNode, camelCaseOption);
        if (propertyName === undefined || propertyName === '') return;

        const className = entry.classesMap[propertyName];
        if (className === undefined || className === '') return;

        entry.classes[className] = true;
      },
      'Program:exit': () => {
        Object.values(importMap).forEach((entry) => {
          markAsUsed.forEach((usedClass) => {
            if (usedClass !== '') entry.classes[usedClass] = true;
          });

          const unusedClasses = Object.entries(entry.classes)
            .filter(([, used]) => used === false)
            .map(([className]) => className);

          if (unusedClasses.length > 0) {
            context.report({
              node: entry.node,
              message: `Unused classes found in ${path.basename(entry.filePath)}: ${unusedClasses.join(', ')}`
            });
          }
        });
      }
    };
  }
};
