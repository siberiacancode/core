const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const deepMerge = <T>(generated: T, overrides?: Partial<T>): T => {
  if (!overrides) return generated;

  const result = { ...generated } as T;

  for (const key in overrides) {
    const typedKey = key as keyof T;
    const overrideValue = overrides[typedKey];
    const generatedValue = result[typedKey];

    if (isRecord(overrideValue) && isRecord(generatedValue)) {
      result[typedKey] = deepMerge(generatedValue, overrideValue as Partial<typeof generatedValue>);
      continue;
    }

    if (overrideValue !== undefined) {
      result[typedKey] = overrideValue as T[keyof T];
    }
  }

  return result;
};
