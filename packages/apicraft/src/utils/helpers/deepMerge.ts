export const deepMerge = <Data extends object>(defaults: Data, overrides?: Partial<Data>): Data => {
  if (!overrides) return defaults;

  const result = { ...defaults };

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
      result[key] = deepMerge(base, override);
    } else {
      result[key] = override as Data[typeof key];
    }
  }

  return result;
};
