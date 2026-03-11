import { capitalize } from './capitalize';
import { lowercase } from './lowercase';

export const normalizeName = (name: string) =>
  lowercase(
    name
      .split(/[^a-z0-9]+/i)
      .filter(Boolean)
      .map(capitalize)
      .join('')
  );
