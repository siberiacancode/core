import type { InlineConfig } from 'vitest/node';

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export type FileIgnoreRule = ((file: string) => boolean) | string | RegExp;

export interface GetFilesOptions {
  ignore?: FileIgnoreRule[];
}

export interface GetTsFilesOptions extends GetFilesOptions {
  extensions?: string[];
}

export type Vitest = InlineConfig;

const defaultCoverageIgnore: FileIgnoreRule[] = [/\.d\.[cm]?ts$/, /\.(test|spec)\.[cm]?tsx?$/];

const defaultTsExtensions = ['.ts', '.tsx', '.mts', '.cts'];

const normalizeFilePath = (file: string) => file.replaceAll('\\', '/');

const isIgnored = (file: string, ignore: FileIgnoreRule[]) =>
  ignore.some((rule) => {
    if (typeof rule === 'string') return file.includes(normalizeFilePath(rule));
    if (rule instanceof RegExp) return rule.test(file);

    return rule(file);
  });

export const getFiles = (directory = 'src', options: GetFilesOptions = {}): string[] => {
  const ignore = options.ignore ?? [];
  const normalizedDirectory = normalizeFilePath(directory);

  if (!existsSync(normalizedDirectory) || isIgnored(normalizedDirectory, ignore)) return [];

  return readdirSync(normalizedDirectory, { withFileTypes: true }).flatMap((entry) => {
    const file = normalizeFilePath(join(normalizedDirectory, entry.name));

    if (isIgnored(file, ignore)) return [];

    return entry.isDirectory() ? getFiles(file, options) : [file];
  });
};

export const getTsFiles = (directory = 'src', options: GetTsFilesOptions = {}): string[] => {
  const extensions = options.extensions ?? defaultTsExtensions;

  return getFiles(directory, options).filter((file) =>
    extensions.some((extension) => file.endsWith(extension))
  );
};

export const getCoverageInclude = (directory = 'src', options: GetFilesOptions = {}): string[] =>
  getTsFiles(directory, {
    ...options,
    ignore: [...defaultCoverageIgnore, ...(options.ignore ?? [])]
  });

export const vitest: Vitest = {
  globals: true,
  environment: 'jsdom',
  clearMocks: true,
  restoreMocks: true,
  mockReset: true,
  coverage: {
    enabled: true,
    provider: 'v8',
    reporter: ['text'],
    include: getCoverageInclude()
  }
};
