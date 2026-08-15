import type { TestidNode } from '../../types';

interface ValidateOptions {
  separator: string;
}

const SEGMENT_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/i;

export const validate = (nodes: TestidNode[], options: ValidateOptions) => {
  const issues: any[] = [];
  const seen = new Map<string, string[]>();

  nodes.forEach((node) => {
    if (node.path.length < 2) {
      issues.push({
        level: 'error',
        path: node.path,
        message: `"${node.id}" is a bare group, a testid needs at least one more segment`
      });
    }

    node.path.forEach((segment) => {
      if (segment.includes(options.separator)) {
        issues.push({
          level: 'error',
          path: node.path,
          message: `segment "${segment}" contains the separator "${options.separator}", which makes the id ambiguous`
        });
        return;
      }

      if (!SEGMENT_PATTERN.test(segment)) {
        issues.push({
          level: 'error',
          path: node.path,
          message: `segment "${segment}" must be alphanumeric (underscores allowed)`
        });
      }
    });

    const duplicate = seen.get(node.id);
    if (duplicate) {
      issues.push({
        level: 'error',
        path: node.path,
        message: `duplicate id "${node.id}", already declared by ${duplicate.join('.')}`
      });
    } else {
      seen.set(node.id, node.path);
    }
  });

  return issues;
};
