import { execSync } from 'node:child_process';
import * as nodeFs from 'node:fs';
import * as nodePath from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

import { collectGeneratedFiles } from './helpers';

export const mockFolderPath = nodePath.join(__dirname, 'mock');
export const generatedFolderPath = nodePath.join(mockFolderPath, 'generated');
export const cliPath = nodePath.join(__dirname, '..', 'dist', 'bin', 'bin.mjs');

afterAll(() => nodeFs.promises.rm(generatedFolderPath, { recursive: true, force: true }));

describe('apicraft', () => {
  it('Should match snapshots', async () => {
    execSync(`node ${JSON.stringify(cliPath)}`, { cwd: mockFolderPath });

    const generatedFiles = await collectGeneratedFiles(generatedFolderPath);
    expect(generatedFiles).toMatchSnapshot();
  });
});
