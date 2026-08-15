import colors from 'picocolors';

import type { TestidIssue, TestidUsage } from '@/src/types';

export const SYMBOLS = {
  error: colors.red('✖'),
  warning: colors.yellow('▲'),
  success: colors.green('✔'),
  info: colors.cyan('◆'),
  bullet: colors.dim('│')
} as const;

const STATUS = {
  unused: {
    color: colors.red,
    symbol: SYMBOLS.error,
    label: 'unused',
    hint: 'declared in the schema, referenced nowhere'
  },
  used: {
    color: colors.green,
    symbol: SYMBOLS.success,
    label: 'used',
    hint: 'constant path is referenced'
  }
} as const;

export const title = (value: string) => `\n${SYMBOLS.info}  ${colors.bold(value)}\n`;

export const issues = (list: TestidIssue[]) =>
  list
    .map((issue) => {
      const symbol = issue.level === 'error' ? SYMBOLS.error : SYMBOLS.warning;
      return `  ${symbol} ${colors.bold(issue.path.join('.'))}\n    ${colors.dim(issue.message)}`;
    })
    .join('\n');

const pad = (value: string, width: number) => value + ' '.repeat(Math.max(0, width - value.length));

export const summary = (usage: TestidUsage[]) => {
  const order = ['used', 'unused'] as const;

  return order
    .map((status) => {
      const count = usage.filter((entry) => entry.status === status).length;
      const meta = STATUS[status];
      return `  ${meta.symbol} ${pad(meta.label, 8)} ${meta.color(String(count))}`;
    })
    .join('\n');
};

export const section = (usage: TestidUsage[], status: TestidUsage['status'], verbose: boolean) => {
  const entries = usage.filter((entry) => entry.status === status);
  if (!entries.length) return '';

  const meta = STATUS[status];
  const width = Math.max(...entries.map((entry) => entry.id.length)) + 2;

  const lines = entries.map((entry) => {
    const head = `    ${meta.color(pad(entry.id, width))}${colors.dim(entry.accessor)}`;
    if (!verbose) return head;

    const files = entry.files.map((file) => `      ${colors.dim(file)}`);
    return [head, ...files].join('\n');
  });

  return [
    `\n  ${meta.symbol} ${colors.bold(meta.label)} ${colors.dim(`— ${meta.hint}`)}`,
    ...lines
  ].join('\n');
};
