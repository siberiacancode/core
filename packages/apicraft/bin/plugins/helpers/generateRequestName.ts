import { capitalize } from './capitalize';

export const generateRequestName = (method: string, path: string) => {
  const pathParts = path.split('/');

  const nameParts: string[] = [];
  let prevPart: string | undefined;

  for (const pathPart of pathParts) {
    const isParam = pathPart.startsWith('{') && pathPart.endsWith('}');

    if (!isParam) {
      nameParts.push(capitalize(pathPart));
      prevPart = pathPart;

      continue;
    }

    // TODO determine how we handle params
    if (prevPart?.endsWith('s')) {
      nameParts[nameParts.length - 1] =
        prevPart.slice(0, -1).charAt(0).toUpperCase() + prevPart.slice(1, -1);
    }

    const paramName = pathPart.slice(1, -1);
    nameParts.push(`By${capitalize(paramName)}`);

    prevPart = pathPart;
  }

  return method.toLowerCase() + nameParts.join('');
};
