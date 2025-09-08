interface IsRequestIncludedParams {
  exclude?: string[];
  include?: string[];
  method: string;
  path: string;
}

export const isRequestIncluded = ({
  method,
  path,
  include,
  exclude
}: IsRequestIncludedParams): boolean => {
  if (!include?.length && !exclude?.length) return true;

  const requestKey = `${method.toUpperCase()} ${path}`;

  const matches = (patterns: string[]) =>
    patterns.some((pattern) => {
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        return new RegExp(pattern.slice(1, -1)).test(requestKey);
      }

      return pattern === requestKey;
    });

  return (!!exclude?.length && !matches(exclude)) || (!!include?.length && matches(include));
};
