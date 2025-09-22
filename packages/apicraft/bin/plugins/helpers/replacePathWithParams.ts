export const replacePathWithParams = (path: string) => path.replace(/\{(\w+)\}/g, '${path.$1}');
