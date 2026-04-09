import type { IR } from '@hey-api/openapi-ts';

export interface GetRequestResponseInfoResult {
  hasErrorResponse: boolean;
  hasSuccessResponse: boolean;
}

export const getRequestResponseInfo = (request: IR.OperationObject) => {
  const responses = request.responses ?? {};
  const result: GetRequestResponseInfoResult = {
    hasSuccessResponse: false,
    hasErrorResponse: false
  };

  const isUnknownSchema = (schema: IR.SchemaObject | undefined) =>
    !schema || schema.type === 'unknown' || (schema.type === 'object' && !schema.properties);

  if (
    Object.entries(responses).some(
      ([code, response]) => /2\d{2}/.test(code) && !isUnknownSchema(response?.schema)
    )
  ) {
    result.hasSuccessResponse = true;
  }
  if (
    Object.entries(responses).some(
      ([code, response]) => /[45]\d{2}/.test(code) && !isUnknownSchema(response?.schema)
    )
  ) {
    result.hasErrorResponse = true;
  }

  let defaultResponse: IR.ResponseObject | undefined;
  for (const [code, response] of Object.entries(responses)) {
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
