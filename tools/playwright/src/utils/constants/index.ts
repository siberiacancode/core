export const HTTP_METHODS = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as const;

export type RequestMethod = (typeof HTTP_METHODS)[number];
