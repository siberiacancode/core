import type { IR } from '@hey-api/openapi-ts';

export const getRequestParamsHookKeys = (request: IR.OperationObject) => ({
  path: Object.values(request.parameters?.path ?? {})
    .filter((param) => param.required)
    .map((param) => param.name),
  query: Object.values(request.parameters?.query ?? {})
    .filter((param) => param.required)
    .map((param) => param.name)
});
