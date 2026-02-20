import type { IR } from '@hey-api/openapi-ts';

interface GetRequestInfoParams {
  request: IR.OperationObject;
}

export interface GetRequestInfoResult {
  hasPathParam: boolean;
  hasRequiredParam: boolean;
  hasResponse: boolean;
}

export const getRequestInfo = ({ request }: GetRequestInfoParams): GetRequestInfoResult => {
  return {
    hasResponse: Object.values(request.responses ?? {}).some(
      (response) => response?.schema.$ref || response?.schema.type !== 'unknown'
    ),
    hasPathParam: !!Object.keys(request.parameters?.path ?? {}).length,
    hasRequiredParam:
      Object.values(request.parameters?.query ?? {}).some((queryParam) => queryParam.required) ||
      Object.values(request.parameters?.path ?? {}).some((pathParam) => pathParam.required) ||
      !!request.body?.required
  };
};
