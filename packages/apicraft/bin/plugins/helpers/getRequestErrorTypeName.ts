import { capitalize } from './capitalize';

export const getRequestErrorTypeName = (requestId: string) => `${capitalize(requestId)}Error`;
