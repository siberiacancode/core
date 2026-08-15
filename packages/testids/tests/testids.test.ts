import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { DEFAULT_NAME, DEFAULT_SEPARATOR } from '@/src/utils/constants';
import { collectUsage, flatten, readSchema } from '@/src/utils/helpers';

const PROJECT = resolve(import.meta.dirname, 'mock/project');

const usage = async () => {
  const nodes = flatten(await readSchema(resolve(PROJECT, 'testids.yaml')), {
    name: DEFAULT_NAME,
    separator: DEFAULT_SEPARATOR
  });
  const result = await collectUsage(nodes, {
    cwd: PROJECT,
    output: 'src/constants/testids.ts'
  });

  return Object.fromEntries(result.map((entry) => [entry.id, entry]));
};

describe('testids', () => {
  it('Should mark a referenced constant path as used regardless of context', async () => {
    const result = await usage();

    expect(result['clickable-button-next'].status).toBe('used');
    expect(result['clickable-button-prev'].status).toBe('used');
    expect(result['clickable-modal-close'].status).toBe('used');
  });

  it('Should not count a raw id string as usage', async () => {
    expect((await usage())['static-label-title'].status).toBe('unused');
  });

  it('Should mark paths referenced nowhere as unused', async () => {
    const result = await usage();

    expect(result['clickable-button-submit'].status).toBe('unused');
    expect(result['static-label-subtitle'].status).toBe('unused');
  });

  it('Should count dynamic access against every leaf below the accessor', async () => {
    expect((await usage())['changeable-select-country'].status).toBe('used');
  });

  it('Should record every file where a path was referenced', async () => {
    expect((await usage())['clickable-button-next'].files).toStrictEqual([
      'e2e/pager.spec.ts',
      'src/components/Pager.tsx'
    ]);
  });

  it('Should support parent branch access', async () => {
    const file = resolve(PROJECT, 'src/branch.ts');
    await mkdir(resolve(PROJECT, 'src'), { recursive: true });
    await writeFile(file, 'const buttons = TESTIDS.clickable.button;', 'utf8');

    try {
      const result = await usage();

      expect(result['clickable-button-submit'].status).toBe('used');
    } finally {
      await unlink(file).catch(() => undefined);
    }
  });
});
