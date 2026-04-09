import type { IR } from '@hey-api/openapi-ts';

import nodePath from 'node:path';

import type { ApicraftOption } from '@/bin/schemas';

import { normalizeName } from './normalizeName';

interface GetRequestFilePathsParams {
  groupBy: ApicraftOption['groupBy'];
  output: string;
  request: IR.OperationObject;
  requestName: string;
}

export const getRequestFilePath = ({
  request,
  requestName,
  groupBy,
  output
}: GetRequestFilePathsParams) => {
  if (groupBy === 'tags') {
    const tag = request.tags?.[0] ?? 'default';

    return nodePath.normalize(`${output}/requests/${normalizeName(tag)}/${requestName}`);
  }

  if (groupBy === 'paths') {
    return nodePath.normalize(`${output}/requests/${request.path}/${request.method.toLowerCase()}`);
  }

  throw new Error(`Unsupported groupBy option ${groupBy}`);
};
