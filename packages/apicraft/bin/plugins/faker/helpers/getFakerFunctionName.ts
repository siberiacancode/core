import { capitalize, normalizeName } from '../../helpers';

export const getFakerFunctionName = (name: string) =>
  `create${capitalize(normalizeName(name))}Fake`;
