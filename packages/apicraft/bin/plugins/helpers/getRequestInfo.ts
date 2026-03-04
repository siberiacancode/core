import type { IR } from '@hey-api/openapi-ts';

import type { GetRequestResponseInfoResult } from './getRequestResponseInfo';

import { getRequestResponseInfo } from './getRequestResponseInfo';

export interface GetRequestInfoResult extends GetRequestResponseInfoResult {
  hasPathParam: boolean;
  hasRequiredParam: boolean;
}

export const getRequestInfo = (request: IR.OperationObject): GetRequestInfoResult => ({
  ...getRequestResponseInfo(request),
  hasPathParam: !!Object.keys(request.parameters?.path ?? {}).length,
  hasRequiredParam:
    Object.values(request.parameters?.query ?? {}).some((queryParam) => queryParam.required) ||
    Object.values(request.parameters?.path ?? {}).some((pathParam) => pathParam.required) ||
    !!request.body?.required
});
