import type { IR } from '@hey-api/openapi-ts';

export interface GetRequestResponseInfoResult {
  hasErrorResponse: boolean;
  hasSuccessResponse: boolean;
}

// copy hey api logic https://github.com/hey-api/openapi-ts/blob/main/packages/shared/src/ir/operation.ts#L109
export const getRequestResponseInfo = (request: IR.OperationObject) => {
  const result: GetRequestResponseInfoResult = {
    hasSuccessResponse: false,
    hasErrorResponse: false
  };

  if (Object.entries(request.responses ?? {}).some(([code]) => /2\d{2}/.test(code))) {
    result.hasSuccessResponse = true;
  }
  if (Object.entries(request.responses ?? {}).some(([code]) => /[45]\d{2}/.test(code))) {
    result.hasErrorResponse = true;
  }

  let defaultResponse: IR.ResponseObject | undefined;
  for (const [code, response] of Object.entries(request.responses ?? {})) {
    if (code === 'default' && response) defaultResponse = response;
  }
  if (!defaultResponse) return result;

  const defaultResponseDescription = (defaultResponse.schema.description ?? '').toLocaleLowerCase();
  const defaultResponseRef = (defaultResponse.schema.$ref ?? '').toLocaleLowerCase();

  const successKeywords = ['success'];
  if (
    !result.hasSuccessResponse ||
    successKeywords.some(
      (successKeyword) =>
        defaultResponseDescription.includes(successKeyword) ||
        defaultResponseRef.includes(successKeyword)
    )
  ) {
    result.hasSuccessResponse = true;
    return result;
  }

  result.hasErrorResponse = true;

  return result;
};
