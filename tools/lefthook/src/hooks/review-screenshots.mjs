import { execFileSync } from 'node:child_process';
import process, { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

const screenshotsPattern = process.argv[2] ?? 'tests/**/*.png';

const git = (...args) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const getUpstreamSha = () => {
  try {
    return git('rev-parse', '@{u}');
  } catch {
    return null;
  }
};

const localSha = git('rev-parse', 'HEAD');
const remoteSha = getUpstreamSha();

if (!remoteSha) {
  process.exit(0);
}

const output = git(
  'diff',
  '--name-status',
  '--diff-filter=AMD',
  remoteSha,
  localSha,
  '--',
  screenshotsPattern
);

const screenshots = output
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const [status, path] = line.split('\t');

    return {
      status,
      path,
    };
  });

if (!screenshots.length) {
  process.exit(0);
}

const main = async () => {
  stdout.write('\nScreenshot changes detected:\n\n');

  for (const { status, path } of screenshots) {
    stdout.write(`  ${status}  ${path}\n`);
  }

  if (!stdin.isTTY || !stdout.isTTY) {
    console.error('\nScreenshot changes require manual review.');
    process.exit(1);
  }

  const readline = createInterface({
    input: stdin,
    output: stdout,
  });

  try {
    const answer = await readline.question(
      '\nHave you reviewed these screenshot changes? [y/N] '
    );

    if (!['y', 'yes'].includes(answer.trim().toLowerCase())) {
      console.error('\nPush cancelled.');
      process.exit(1);
    }
  } finally {
    readline.close();
  }

  stdout.write('\nScreenshot changes confirmed.\n');
};

main();
