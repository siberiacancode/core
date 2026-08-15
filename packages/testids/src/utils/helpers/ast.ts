import { parseSync } from 'oxc-parser';

interface AstNode {
  end?: number;
  start?: number;
  type: string;
  [key: string]: unknown;
}

export const parseSource = (filename: string, source: string) => {
  const result = parseSync(filename, source);

  if (result.errors.length) {
    const message = result.errors.map((error) => error.message).join('\n');
    throw new Error(`failed to parse "${filename}":\n${message}`);
  }

  return result.program as unknown as AstNode;
};

export const walkAst = (
  node: unknown,
  visit: (node: AstNode, parent: AstNode | null) => void,
  parent: AstNode | null = null
) => {
  if (!node || typeof node !== 'object') return;

  if (Array.isArray(node)) {
    node.forEach((child) => walkAst(child, visit, parent));
    return;
  }

  const current = node as AstNode;
  if (typeof current.type !== 'string') return;

  visit(current, parent);

  Object.entries(current).forEach(([key, child]) => {
    if (key === 'parent') return;
    if (!child || typeof child !== 'object') return;
    walkAst(child, visit, current);
  });
};
