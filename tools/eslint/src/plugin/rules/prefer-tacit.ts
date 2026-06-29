import type { Rule } from 'eslint';
import type * as ESTree from 'estree';

// Disallows unnecessary arrow wrappers like `(...args) => fn(...args)` that
// can be replaced with a direct reference `fn` (point-free / composition).
//
// Flags:
//   () => fn()                    →  fn
//   (a) => fn(a)                  →  fn
//   (a, b) => fn(a, b)            →  fn
//   (x) => { return fn(x); }      →  fn
//
// Skips (different semantics):
//   (a) => obj.method(a)          — would lose `this`
//   () => new Fn()                — `new` call
//   (a) => fn(a, 1)               — extra/missing arguments
//   (a) => fn(b)                  — different identifier
//   (a, b) => fn(b, a)            — order changed
//   (a = 1) => fn(a)              — default value changes semantics
//   ({ x }) => fn(x)              — destructured params
//   <T>(a: T) => fn(a)            — generic, may be intentional type-conversion
//   (a): number => fn(a)          — explicit return type, treated as a contract
//   async (a) => fn(a)            — async wrapper changes return type
//   function (a) { return fn(a) } — `function` keyword: `this` / `arguments`
//
// Auto-fix replaces the whole arrow with the bare callee.

type IdentifierParam = ESTree.Identifier & { optional?: boolean };

const isSimpleIdentifierParam = (param: ESTree.Pattern): param is IdentifierParam =>
  param.type === 'Identifier' && !(param as IdentifierParam).optional;

const paramsMatchArgs = (
  params: ESTree.Pattern[],
  args: (ESTree.Expression | ESTree.SpreadElement)[]
): boolean => {
  if (params.length !== args.length) return false;
  for (let i = 0; i < params.length; i++) {
    const p = params[i];
    const a = args[i];

    if (!p || !a) return false;
    if (!isSimpleIdentifierParam(p)) return false;
    if (a.type !== 'Identifier') return false;
    if (a.name !== p.name) return false;
  }

  return true;
};

const stripVoid = (node: ESTree.Expression): ESTree.Expression =>
  node.type === 'UnaryExpression' && node.operator === 'void'
    ? (node.argument as ESTree.Expression)
    : node;

const getCallFromBody = (
  body: ESTree.BlockStatement | ESTree.Expression
): ESTree.CallExpression | null => {
  if (body.type !== 'BlockStatement') {
    const unwrapped = stripVoid(body);
    if (unwrapped.type === 'CallExpression') return unwrapped;
    return null;
  }

  if (
    body.body.length === 1 &&
    body.body[0]?.type === 'ReturnStatement' &&
    body.body[0].argument
  ) {
    const ret = stripVoid(body.body[0].argument);
    if (ret.type === 'CallExpression') return ret;
  }

  return null;
};

type ArrowWithTypes = ESTree.ArrowFunctionExpression & {
  returnType?: unknown;
  typeParameters?: unknown;
};

type CallWithTypeArgs = ESTree.CallExpression & { typeArguments?: unknown };

export const preferTacit: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow unnecessary arrow wrappers. Pass the function directly: `(a) => fn(a)` → `fn`.'
    },
    fixable: 'code',
    schema: [],
    messages: {
      unnecessaryWrap:
        'Unnecessary wrapper `({{params}}) => {{callee}}({{params}})`. Pass `{{callee}}` directly.'
    }
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      ArrowFunctionExpression(node: ArrowWithTypes) {
        if (node.async) return;
        if (node.returnType) return;
        if (node.typeParameters) return;
        if (node.params.some((p: ESTree.Pattern) => !isSimpleIdentifierParam(p))) return;

        const call = getCallFromBody(node.body);

        if (call === null) return;
        if (call.callee.type !== 'Identifier') return;
        if ((call).typeArguments) return;
        if (
          call.arguments.some(
            (a: ESTree.Expression | ESTree.SpreadElement) => a.type === 'SpreadElement'
          )
        )
          return;
        if (!paramsMatchArgs(node.params, call.arguments)) return;

        const calleeText = sourceCode.getText(call.callee);
        const paramsText = (node.params as IdentifierParam[]).map((p) => p.name).join(', ');

        context.report({
          node,
          messageId: 'unnecessaryWrap',
          data: { callee: calleeText, params: paramsText },
          fix: (fixer) => fixer.replaceText(node, calleeText)
        });
      }
    };
  }
};
