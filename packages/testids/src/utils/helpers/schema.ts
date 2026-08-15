import { readFile } from 'node:fs/promises';
import yaml from 'yaml';

import type { TestidTree } from '../../types';

export const readSchema = async (input: string) => {
  try {
    return yaml.parse(await readFile(input, 'utf8')) as TestidTree;
  } catch (error: any) {
    if (error?.code === 'ENOENT') throw new Error(`testids schema not found at "${input}"`);
    throw new Error(`failed to read testids schema at "${input}" — ${error.message}`);
  }
};
