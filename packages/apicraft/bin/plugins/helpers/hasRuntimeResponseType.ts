import nodeFs from 'node:fs';
import nodePath from 'node:path';

export const hasRuntimeResponseType = (runtimeInstancePath: string) => {
  const content = nodeFs.readFileSync(
    nodePath.extname(runtimeInstancePath) === 'ts'
      ? runtimeInstancePath
      : `${runtimeInstancePath}.ts`,
    'utf-8'
  );

  return /export\s+(?:type|interface)\s+ApicraftApiResponse\b/.test(content);
};
