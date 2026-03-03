import { capitalize } from '../capitalize';

export const normalizeRequestName = (name: string) =>
  name
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map(capitalize)
    .join('');
