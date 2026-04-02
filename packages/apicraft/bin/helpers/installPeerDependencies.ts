import fs from 'node:fs/promises';
import nodePath from 'node:path';

export type Dependency = '@siberiacancode/fetches' | '@tanstack/react-query' | 'axios' | 'ofetch';

export const dependencyVersionsMap: Record<Dependency, string> = {
  axios: '^1.13.6',
  ofetch: '^1.5.1',
  '@siberiacancode/fetches': '^1.14.1',
  '@tanstack/react-query': '^5.90.21'
};

export const installPeerDependencies = async (dependencies: Dependency[]) => {
  const cwd = process.cwd();

  const packageJsonPath = nodePath.join(cwd, 'package.json');
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonContent) as Record<string, any>;

  dependencies.forEach((dependency) => {
    packageJson.dependencies ??= {};
    packageJson.dependencies[dependency] = dependencyVersionsMap[dependency];
  });

  console.log(`Adding dependencies to package.json: ${dependencies.join(', ')}`);
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log('You can install new packages by running your package manager install command');
};
