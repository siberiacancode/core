export const replaceParamsPath = (path: string) => path.replace(/\{(\w+)\}/g, '${path.$1}');
