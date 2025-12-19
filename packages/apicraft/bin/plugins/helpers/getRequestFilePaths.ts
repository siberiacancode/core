import type { IR } from '@hey-api/openapi-ts';

import * as nodePath from 'node:path';

import type { ApicraftOption } from '@/bin/schemas';

interface GetRequestFilePathsParams {
  groupBy: ApicraftOption['groupBy'];
  output: string;
  request: IR.OperationObject;
  requestName: string;
}

export const getRequestFilePaths = ({
  request,
  requestName,
  groupBy,
  output
}: GetRequestFilePathsParams) => {
  if (groupBy === 'tag') {
    const tags = request.tags ?? ['default'];

    return tags.map((tag) => nodePath.normalize(`${output}/requests/${tag}/${requestName}`));
  }

  if (groupBy === 'path') {
    return [
      nodePath.normalize(`${output}/requests/${request.path}/${request.method.toLowerCase()}`)
    ];
  }

  throw new Error(`Unsupported groupBy option ${groupBy}`);
};
