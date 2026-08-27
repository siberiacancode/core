import { spawn } from 'node:child_process';
import process from 'node:process';

export interface RunOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export const run = (command: string, args: string[], options: RunOptions = {}): Promise<number> =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? process.cwd(),
      env: options.env ?? process.env,
      stdio: 'inherit',
      shell: false
    });

    child.on('error', (error) => {
      console.error(`Failed to run: ${command} (${error.message})`);
      resolve(1);
    });

    child.on('exit', (code) => resolve(code ?? 1));
  });
