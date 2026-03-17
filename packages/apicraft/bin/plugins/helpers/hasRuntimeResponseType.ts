import nodeFs from 'node:fs';

import { getRelativePath } from './getRelativePath';

export const hasRuntimeResponseType = (runtimeInstancePath: string) => {
  const content = nodeFs.readFileSync(getRelativePath(__dirname, runtimeInstancePath), 'utf-8');

  return /export\s+(?:type|interface)\s+ApicraftApiResponse\b/.test(content);
};
