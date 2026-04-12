import type { Rule } from 'eslint';
import type * as ESTree from 'estree';

type FunctionType = 'arrow-function' | 'function-declaration' | 'function-expression';

type NodeWithParent = ESTree.Node & { parent?: NodeWithParent };
type FunctionNode =
  | (ESTree.ArrowFunctionExpression & { parent?: NodeWithParent })
  | (ESTree.FunctionDeclaration & { parent?: NodeWithParent })
  | (ESTree.FunctionExpression & { parent?: NodeWithParent });

const NAMED_TEMPLATES: Record<FunctionType, string> = {
  'function-declaration': 'function {name}{typeParams}({params}){returnType} {body}',
  'arrow-function':
    '{varType} {name}{typeAnnotation} = {typeParams}({params}){returnType} => {body}',
  'function-expression':
    '{varType} {name}{typeAnnotation} = function{typeParams}({params}){returnType} {body}'
};

const buildFunction = (template: string, parts: Record<string, string | undefined>): string =>
  Object.keys(parts).reduce(
    (acc, key) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), () => parts[key] ?? ''),
    template
  );

const hasName = (node: FunctionNode): boolean => {
  if (node.type === 'FunctionDeclaration') return true;
  return (node as NodeWithParent).parent?.type === 'VariableDeclarator';
};

const getName = (node: FunctionNode): string | undefined => {
  if (node.type === 'FunctionDeclaration' && node.id?.type === 'Identifier') return node.id.name;
  const parent = (node as NodeWithParent).parent;
  if (
    (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') &&
    parent?.type === 'VariableDeclarator' &&
    parent.id?.type === 'Identifier'
  )
    return parent.id.name;
  return undefined;
};

const getTypeParams = (node: FunctionNode): ESTree.Node | undefined => {
  const n = node as ESTree.FunctionDeclaration & { typeParameters?: ESTree.Node };
  return n.typeParameters;
};

const getNodeText = (
  sourceCode: Rule.RuleContext['sourceCode'],
  node: ESTree.Node | null | undefined
): string | undefined => {
  if (!node || !('range' in node) || !node.range) return undefined;
  return sourceCode.getText(node as ESTree.Node & { range: [number, number] });
};

const getParams = (
  sourceCode: Rule.RuleContext['sourceCode'],
  node: FunctionNode
): string | undefined => {
  if (node.params.length === 0) return undefined;
  const first = node.params[0];
  const last = node.params[node.params.length - 1];
  if (first == null || last == null || !('range' in first) || !('range' in last)) return undefined;
  return sourceCode.getText({
    range: [first.range![0], last.range![1]]
  } as ESTree.Node & { range: [number, number] });
};

const getBody = (sourceCode: Rule.RuleContext['sourceCode'], node: FunctionNode): string => {
  const body = node.body;
  if (!('range' in body) || !body.range) return '{}';
  const text = sourceCode.getText(body as ESTree.Node & { range: [number, number] });
  if (body.type === 'BlockStatement') return text;
  return `{\n  return ${text}\n}`;
};

const getTypeAnnotation = (
  sourceCode: Rule.RuleContext['sourceCode'],
  node: FunctionNode
): string | undefined => {
  if (!hasName(node) || node.type === 'FunctionDeclaration') return undefined;
  const parent = (node as NodeWithParent).parent;
  if (parent?.type !== 'VariableDeclarator' || parent.id?.type !== 'Identifier') return undefined;
  const id = parent.id;
  if (!('typeAnnotation' in id) || id.typeAnnotation === undefined || id.typeAnnotation === null)
    return undefined;
  return getNodeText(sourceCode, id.typeAnnotation as ESTree.Node);
};

const isUnfixableExport = (node: ESTree.Node): boolean =>
  node.type === 'FunctionDeclaration' &&
  (node as NodeWithParent).parent?.type === 'ExportDefaultDeclaration';

const isFunctionExpressionWithName = (node: FunctionNode): boolean =>
  node.type === 'FunctionExpression' && 'id' in node && node.id !== null && node.id !== undefined;

const JSX_TYPES = ['JSXElement', 'JSXFragment'];

type ASTNode = ESTree.Node & { type: string };
interface RuleOptions {
  namedComponents?: FunctionType | FunctionType[];
}

/** Walk AST and return true if any descendant is JSX */
const containsJSX = (node: ASTNode): boolean => {
  if (JSX_TYPES.includes(node.type)) return true;
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue;
    const value = (node as unknown as Record<string, unknown>)[key];
    if (value !== null && value !== undefined && typeof value === 'object') {
      if (Array.isArray(value)) {
        if (
          value.some(
            (child: unknown): boolean =>
              child !== null &&
              child !== undefined &&
              typeof child === 'object' &&
              'type' in child &&
              containsJSX(child as ASTNode)
          )
        )
          return true;
      } else if (
        value !== null &&
        value !== undefined &&
        typeof value === 'object' &&
        'type' in value &&
        containsJSX(value as ASTNode)
      )
        return true;
    }
  }
  return false;
};

const walk = (node: ASTNode, visit: (n: ASTNode) => void): void => {
  visit(node);
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue;
    const value = (node as unknown as Record<string, unknown>)[key];
    if (value !== null && value !== undefined && typeof value === 'object') {
      if (Array.isArray(value))
        value.forEach((child: unknown) => {
          if (child !== null && child !== undefined && typeof child === 'object' && 'type' in child)
            walk(child as ASTNode, visit);
        });
      else if (
        value !== null &&
        value !== undefined &&
        typeof value === 'object' &&
        'type' in value
      )
        walk(value as ASTNode, visit);
    }
  }
};

/** Collect component nodes: functions that contain JSX (and for expr/arrow, are in VariableDeclarator) */
const getComponentNodes = (program: ESTree.Program): Set<ESTree.Node> => {
  const components = new Set<ESTree.Node>();
  let fileHasJSX = false;
  walk(program as ASTNode, (n) => {
    const type = (n as { type: string }).type;
    if (type === 'JSXElement' || type === 'JSXFragment') fileHasJSX = true;
  });
  if (!fileHasJSX) return components;
  walk(program as ASTNode, (n) => {
    if (n.type === 'FunctionDeclaration' && containsJSX(n)) components.add(n as ESTree.Node);
    const withParent = n as ASTNode & { parent?: { type: string } };
    if (
      (n.type === 'ArrowFunctionExpression' || n.type === 'FunctionExpression') &&
      withParent.parent?.type === 'VariableDeclarator' &&
      containsJSX(n)
    )
      components.add(n as ESTree.Node);
  });
  return components;
};

export const functionComponentDefinition: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a specific function type for function components'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          namedComponents: {
            anyOf: [
              {
                enum: ['function-declaration', 'arrow-function', 'function-expression']
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['function-declaration', 'arrow-function', 'function-expression']
                }
              }
            ]
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      'function-declaration': 'Function component is not a function declaration',
      'function-expression': 'Function component is not a function expression',
      'arrow-function': 'Function component is not an arrow function'
    }
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options: RuleOptions = (context.options[0] ?? {}) as RuleOptions;
    const namedConfig = ([] as FunctionType[]).concat(
      options.namedComponents ?? 'function-declaration'
    );

    let fileVarType = 'var';
    const validatePairs: [FunctionNode, FunctionType][] = [];
    let componentNodes: Set<ESTree.Node> = new Set();

    const getFixer = (
      node: FunctionNode,
      fixOptions: {
        type: FunctionType;
        template: string;
        range: [number, number];
      }
    ): ((fixer: Rule.RuleFixer) => unknown) | undefined => {
      const typeAnnotation = getTypeAnnotation(sourceCode, node);
      if (fixOptions.type === 'function-declaration' && typeAnnotation) return undefined;
      if (isUnfixableExport(node)) return undefined;
      if (isFunctionExpressionWithName(node)) return undefined;

      let varType = fileVarType;
      const parent = (node as NodeWithParent).parent;
      if (
        (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') &&
        parent?.type === 'VariableDeclarator' &&
        (parent as NodeWithParent).parent?.type === 'VariableDeclaration'
      ) {
        varType = ((parent as NodeWithParent).parent as ESTree.VariableDeclaration).kind;
      }

      const typeParamsNode = getTypeParams(node);
      const typeParams = getNodeText(sourceCode, typeParamsNode);
      const params = getParams(sourceCode, node);
      const returnType = getNodeText(
        sourceCode,
        'returnType' in node
          ? (node as ESTree.FunctionDeclaration & { returnType?: ESTree.Node }).returnType
          : undefined
      );
      const body = getBody(sourceCode, node);
      const name = getName(node);

      const text = buildFunction(fixOptions.template, {
        typeAnnotation,
        typeParams,
        params,
        returnType,
        body,
        name: name !== undefined && name !== null && name !== '' ? name : '',
        varType
      });

      return (fixer: Rule.RuleFixer) => fixer.replaceTextRange(fixOptions.range, text);
    };

    const report = (
      node: FunctionNode,
      fixOptions: {
        messageId: FunctionType;
        type: FunctionType;
        template: string;
        range: [number, number];
      }
    ): void => {
      const fix = getFixer(node, fixOptions);
      context.report({
        node,
        messageId: fixOptions.messageId,
        fix: fix as undefined
      });
    };

    const validate = (node: FunctionNode, functionType: FunctionType): void => {
      if (!componentNodes.has(node)) return;
      if ((node as NodeWithParent).parent?.type === 'Property') return;

      const named = hasName(node);
      if (named && !namedConfig.includes(functionType)) {
        const parent = (node as NodeWithParent).parent;
        report(node, {
          messageId: namedConfig[0],
          type: namedConfig[0],
          template: NAMED_TEMPLATES[namedConfig[0]],
          range:
            node.type === 'FunctionDeclaration'
              ? (node.range as [number, number])
              : (((parent as NodeWithParent)?.parent?.range as [number, number]) ?? node.range!)
        });
      }
    };

    return {
      Program(programNode) {
        componentNodes = getComponentNodes(programNode as ESTree.Program);
      },
      FunctionDeclaration(node) {
        validatePairs.push([node as FunctionNode, 'function-declaration']);
      },
      ArrowFunctionExpression(node) {
        validatePairs.push([node as FunctionNode, 'arrow-function']);
      },
      FunctionExpression(node) {
        validatePairs.push([node as FunctionNode, 'function-expression']);
      },
      VariableDeclaration(node) {
        if (node.kind === 'const' || node.kind === 'let') fileVarType = 'const';
      },
      'Program:exit': function () {
        if (fileVarType === 'var') {
          const hasES6 =
            validatePairs.some(
              ([n]) => (n as NodeWithParent).parent?.type === 'VariableDeclarator'
            ) ||
            (componentNodes.size > 0 && validatePairs.length > 0);
          if (hasES6) fileVarType = 'const';
        }
        validatePairs.forEach(([node, type]) => validate(node, type));
      },
      ImportDeclaration: () => {
        fileVarType = 'const';
      },
      ExportNamedDeclaration: () => {
        fileVarType = 'const';
      },
      ExportDefaultDeclaration: () => {
        fileVarType = 'const';
      },
      JSXElement: () => {
        fileVarType = 'const';
      }
    };
  }
};
