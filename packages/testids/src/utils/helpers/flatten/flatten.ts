import type { TestidNode, TestidTree } from '../../types';

interface FlattenOptions {
  name: string;
  separator: string;
}

export const flatten = (tree: TestidTree, options: FlattenOptions): TestidNode[] => {
  const nodes: TestidNode[] = [];

  const toNode = (path: string[]): TestidNode => ({
    path,
    id: path.join(options.separator).toLowerCase(),
    accessor: [options.name, ...path].join('.'),
    group: path[0]
  });

  const walk = (value: unknown, path: string[]) => {
    if (value === null || value === undefined) {
      if (path.length) nodes.push(toNode(path));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === 'string' || typeof item === 'number') {
          nodes.push(toNode([...path, String(item)]));
          return;
        }
        walk(item, path);
      });
      return;
    }

    if (typeof value === 'object') {
      Object.entries(value as Record<string, unknown>).forEach(([key, child]) =>
        walk(child, [...path, key])
      );
      return;
    }

    nodes.push(toNode([...path, String(value)]));
  };

  walk(tree, []);

  return nodes;
};
