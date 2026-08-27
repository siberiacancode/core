interface GetRouteRegexpOptions {
  exact?: boolean;
}

const ESCAPE_REGEXP = /[.*+?^${}()|[\]\\]/g;

export const getRouteRegexp = (pattern: string, options: GetRouteRegexpOptions = {}): RegExp => {
  const source = pattern
    .replace(ESCAPE_REGEXP, '\\$&')
    .replace(/:[\w.-]+/g, '[^/?#]+')
    .replace(/\\\*/g, '.*');

  return new RegExp(`${options.exact ? '^' : ''}${source}$`);
};
