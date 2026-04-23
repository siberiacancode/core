export const deepMerge = <T extends object>(defaults: T, overrides?: Partial<T>): T => {
  if (!overrides) return defaults;

  const result = { ...defaults } as T;

  for (const key in overrides) {
    const override = overrides[key];
    if (override === undefined) continue;

    const base = defaults[key];
    if (
      base !== null &&
      override !== null &&
      typeof base === 'object' &&
      typeof override === 'object' &&
      !Array.isArray(base) &&
      !Array.isArray(override)
    ) {
      result[key] = deepMerge(base as object, override as object) as T[typeof key];
    } else {
      result[key] = override as T[typeof key];
    }
  }

  return result;
};
