import nodePath from 'node:path';

export const getRelativePath = (from: string, to: string) => {
  const path = nodePath.relative(from, to);
  const segments = path.split(nodePath.sep);

  if (!path.startsWith('..') && !path.startsWith('.') && segments.length === 1) {
    return `./${path}`;
  }

  return path;
};
