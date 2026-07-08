import type { Rule } from 'eslint';

type Quote = 'single' | 'double';
type QuoteChar = "'" | '"';

interface RuleOptions {
  quote?: Quote;
}

const QUOTE_CHARS: Record<Quote, QuoteChar> = { single: "'", double: '"' };
const LINE_TERMINATOR = /[\n\r\u2028\u2029]/;
const TOKENS = /\\[^]|[^]/g;

const toStringLiteral = (raw: string, preferredQuoteChar: QuoteChar) => {
  const tokens: string[] = raw.match(TOKENS) ?? [];
  const alternateQuoteChar: QuoteChar = preferredQuoteChar === "'" ? '"' : "'";

  const quoteChar =
    tokens.includes(preferredQuoteChar) && !tokens.includes(alternateQuoteChar)
      ? alternateQuoteChar
      : preferredQuoteChar;

  let body = '';
  for (const token of tokens) {
    if (token === quoteChar) {
      body += `\\${token}`;
    } else if (token === '\\`' || token === '\\$') {
      body += token[1];
    } else if ((token === "\\'" || token === '\\"') && token[1] !== quoteChar) {
      body += token[1];
    } else {
      body += token;
    }
  }

  return quoteChar + body + quoteChar;
};

export const noUselessTemplateLiteral: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Disallow template literals without interpolation'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          quote: { type: 'string', enum: ['single', 'double'] }
        },
        additionalProperties: false
      }
    ],
    messages: {
      useString: 'Use a regular string instead of a template literal.'
    }
  },
  create(context) {
    const { quote = 'single' } = (context.options[0] ?? {}) as RuleOptions;
    const preferredQuoteChar = QUOTE_CHARS[quote];

    return {
      TemplateLiteral(node) {
        if (node.expressions.length > 0) return;

        if (node.parent.type === 'TaggedTemplateExpression') return;

        const { raw } = node.quasis[0].value;

        if (LINE_TERMINATOR.test(raw)) return;

        context.report({
          node,
          messageId: 'useString',
          fix: (fixer) => fixer.replaceText(node, toStringLiteral(raw, preferredQuoteChar))
        });
      }
    };
  }
};
