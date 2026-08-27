import { join } from 'node:path';
import process from 'node:process';

import { run } from './run';

export interface Mount {
  dst: string;
  ro?: boolean;
  src: string;
}

export interface DockerOptions {
  container: string;
  dockerfile: string;
  image: string;
  mounts: Mount[];
  root?: string;
}

const docker = (args: string[]) => run('docker', args);

export const dockerBuild = ({ dockerfile, image }: DockerOptions) =>
  docker(['build', '-f', dockerfile, '-t', image, '.']);

export const dockerDown = ({ container }: DockerOptions) =>
  docker(['container', 'rm', '-f', container]);

export const dockerUp = async (options: DockerOptions) => {
  const root = options.root ?? process.cwd();
  await dockerDown(options);

  const mountArgs = options.mounts.flatMap((mount) => [
    '-v',
    `${join(root, mount.src)}:${mount.dst}${mount.ro ? ':ro' : ''}`
  ]);

  return docker([
    'run',
    '--name',
    options.container,
    ...mountArgs,
    '-itd',
    options.image
  ]);
};

/** Ensure the container is up, then exec the given CLI args inside it. */
export const dockerExec = async (options: DockerOptions, cliArgs: string[]) => {
  const running = await docker(['inspect', '-f', '.', options.container]);
  if (running !== 0) {
    const built = await dockerBuild(options);
    if (built !== 0) return built;
    const up = await dockerUp(options);
    if (up !== 0) return up;
  }

  return docker(['exec', options.container, 'pw', ...cliArgs]);
};
