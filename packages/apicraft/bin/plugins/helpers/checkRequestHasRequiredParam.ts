import type { IR } from '@hey-api/openapi-ts';

export const checkRequestHasRequiredParam = (request: IR.OperationObject) =>
  Object.values(request.parameters?.query ?? {}).some((queryParam) => queryParam.required) ||
  Object.values(request.parameters?.path ?? {}).some((pathParam) => pathParam.required) ||
  request.body?.required;
