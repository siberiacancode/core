export * from './docker';
export * from './loadEnv';
export * from './run';

/** Parse a `src:dst[:ro]` mount string into a Mount object. */
export const parseMount = (value: string): { dst: string; ro?: boolean; src: string } => {
  const [src, dst, ro] = value.split(':');
  if (!src || !dst) throw new Error(`Invalid mount "${value}", expected "src:dst[:ro]"`);
  return { src, dst, ro: ro === 'ro' };
};
