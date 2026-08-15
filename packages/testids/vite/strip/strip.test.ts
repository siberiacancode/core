import { describe, expect, it } from 'vitest';

import { strip } from './strip';

describe('strip', () => {
  it('Should remove the jsx attribute', async () => {
    const output = (await strip(
      'const a = <button data-testid={TESTIDS.clickable.button.next} />;',
      { attribute: 'data-testid', filename: '/app/App.tsx', sourcemap: false }
    ))!;

    expect(output.code).not.toContain('data-testid');
    expect(output.code).toContain('<button />');
  });

  it('Should remove the attribute from an object literal', async () => {
    const output = (await strip("const a = { 'data-testid': id, name: 'keep' };", {
      attribute: 'data-testid',
      filename: '/app/App.tsx',
      sourcemap: false
    }))!;

    expect(output.code).not.toContain('data-testid');
    expect(output.code).toContain('name');
  });

  it('Should drop a spread left empty', async () => {
    const output = (await strip("const a = <span {...{ 'data-testid': id }} />;", {
      attribute: 'data-testid',
      filename: '/app/App.tsx',
      sourcemap: false
    }))!;

    expect(output.code).not.toContain('{...{}}');
  });

  it('Should keep unrelated string literals', async () => {
    const result = (await strip("const label = 'data-testid';", {
      attribute: 'data-testid',
      filename: '/app/App.tsx',
      sourcemap: false
    }))!;

    expect(result).toBeNull();
  });

  it('Should keep other attributes', async () => {
    const output = (await strip(
      'const a = <button data-testid={id} onClick={handle} className="a" />;',
      { attribute: 'data-testid', filename: '/app/App.tsx', sourcemap: false }
    ))!;

    expect(output.code).toContain('onClick');
    expect(output.code).toContain('className');
  });

  it('Should parse typescript syntax', async () => {
    const output = (await strip('const a = <input data-testid={id} value={x as string} />;', {
      attribute: 'data-testid',
      filename: '/app/App.tsx',
      sourcemap: false
    }))!;

    expect(output.code).toContain('x as string');
  });

  it('Should respect a custom attribute name', async () => {
    const output = (await strip('const a = <b data-test-id={id} data-testid={other} />;', {
      attribute: 'data-test-id',
      filename: '/app/App.tsx',
      sourcemap: false
    }))!;

    expect(output.code).not.toContain('data-test-id');
    expect(output.code).toContain('data-testid');
  });
});
