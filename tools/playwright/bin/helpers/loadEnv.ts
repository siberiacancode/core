import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

export const loadEnv = async (envFile?: string): Promise<NodeJS.ProcessEnv> => {
  if (!envFile) return process.env;

  const path = resolve(process.cwd(), envFile);
  if (!existsSync(path)) {
    console.error(`Env file not found: ${envFile}`);
    return process.env;
  }

  const { config } = await import('dotenv');
  const { parsed } = config({ path, processEnv: {} });

  return { ...process.env, ...parsed };
};
