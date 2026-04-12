import * as prompts from '@clack/prompts';
import { isPackageExists } from 'local-pkg';

export type Dependency =
  | '@reatom/core'
  | '@siberiacancode/fetches'
  | '@tanstack/react-query'
  | 'axios'
  | 'ofetch';

export const dependencyVersionsMap: Record<Dependency, string> = {
  axios: '^1.13.6',
  ofetch: '^1.5.1',
  '@reatom/core': '^1000.15.1',
  '@siberiacancode/fetches': '^1.14.1',
  '@tanstack/react-query': '^5.90.21'
};

export const installDependencies = async (dependencies: Dependency[]) => {
  const requiredDependencies = dependencies.filter((dependency) => !isPackageExists(dependency));
  if (!requiredDependencies.length) return;

  const confirmed = await prompts.confirm({
    message: `Additional dependencies are required: ${requiredDependencies.join(', ')}. Do you want to install them?`
  });
  if (!confirmed) return;

  const spinner = prompts.spinner();
  spinner.start('Installing required dependencies');

  const { installPackage } = await import('@antfu/install-pkg');
  await installPackage(
    requiredDependencies.map(
      (requiredDependency) => `${requiredDependency}@${dependencyVersionsMap[requiredDependency]}`
    )
  );

  spinner.stop('Installion finished');
};
