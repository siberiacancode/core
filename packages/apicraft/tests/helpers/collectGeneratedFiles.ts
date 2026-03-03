import nodeFs from 'node:fs';
import nodePath from 'node:path';

export const collectGeneratedFiles = async (folderPath: string) => {
  const files: Record<string, string> = {};

  const walk = async (path: string) => {
    const entries = await nodeFs.promises.readdir(path, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === 'types.gen.ts') continue;

      const fullPath = nodePath.join(path, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      const relativePath = nodePath.relative(folderPath, fullPath);
      files[relativePath] = await nodeFs.promises.readFile(fullPath, 'utf8');
    }
  };

  await walk(folderPath);
  return files;
};
