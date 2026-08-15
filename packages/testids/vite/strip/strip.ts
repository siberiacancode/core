import MagicString from 'magic-string';

import { parseSource, walkAst } from '../../src/utils/helpers';

interface StripOptions {
  attribute: string;
  filename: string;
  sourcemap?: boolean;
}

interface Range {
  end: number;
  start: number;
}

const getPropertyName = (node: any) => {
  const key = node.key;

  if (key?.type === 'StringLiteral' || key?.type === 'Literal') return key.value;
  if (key?.type === 'Identifier' && !node.computed) return key.name;

  return null;
};

const getJsxAttributeName = (node: any) => {
  const name = node.name;
  if (!name) return null;

  if (name.type === 'JSXNamespacedName') return `${name.namespace.name}:${name.name.name}`;
  return name.name ?? null;
};

const rangeOf = (node: any): Range | null =>
  typeof node?.start === 'number' && typeof node?.end === 'number'
    ? { start: node.start, end: node.end }
    : null;

const jsxAttributeRange = (code: string, node: any): Range | null => {
  const range = rangeOf(node);
  if (!range) return null;

  let start = range.start;
  while (start > 0 && (code[start - 1] === ' ' || code[start - 1] === '\t')) start -= 1;

  return { start, end: range.end };
};

const propertyRange = (node: any, parent: any): Range | null => {
  const range = rangeOf(node);
  if (!range || parent?.type !== 'ObjectExpression' || !Array.isArray(parent.properties))
    return range;

  const index = parent.properties.indexOf(node);
  const next = parent.properties[index + 1];
  const previous = parent.properties[index - 1];

  if (next) return { start: range.start, end: next.start };
  if (previous) return { start: previous.end, end: range.end };

  return range;
};

export const strip = async (code: string, options: StripOptions) => {
  const ast = parseSource(options.filename, code);
  const edits: Range[] = [];

  walkAst(ast, (node, parent) => {
    if (node.type === 'JSXAttribute' && getJsxAttributeName(node) === options.attribute) {
      const range = jsxAttributeRange(code, node);
      if (range) edits.push(range);
      return;
    }

    if (
      (node.type === 'Property' || node.type === 'ObjectProperty') &&
      getPropertyName(node) === options.attribute
    ) {
      const range = propertyRange(node, parent);
      if (range) edits.push(range);
      return;
    }

    if (node.type !== 'JSXSpreadAttribute') return;

    const argument: any = node.argument;
    if (argument?.type !== 'ObjectExpression' || argument.properties?.length !== 1) return;

    const property = argument.properties[0];
    if (
      (property.type === 'Property' || property.type === 'ObjectProperty') &&
      getPropertyName(property) === options.attribute
    ) {
      const range = jsxAttributeRange(code, node);
      if (range) edits.push(range);
    }
  });

  if (!edits.length) return null;

  const output = new MagicString(code);
  const ranges = edits
    .filter(
      (range, index) =>
        !edits.some(
          (other, otherIndex) =>
            otherIndex !== index &&
            other.start <= range.start &&
            other.end >= range.end &&
            (other.start < range.start || other.end > range.end)
        )
    )
    .sort((a, b) => b.start - a.start);

  ranges.forEach(({ start, end }) => output.remove(start, end));

  return {
    code: output.toString(),
    map:
      options.sourcemap === false
        ? null
        : output.generateMap({ hires: true, source: options.filename, includeContent: true })
  };
};
