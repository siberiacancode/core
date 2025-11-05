import type { IR } from '@hey-api/openapi-ts';

export const getRequestPathParams = (request: IR.OperationObject) =>
  Object.values(request.parameters?.path ?? {}).map((param) => param.name);
