import type { IR } from '@hey-api/openapi-ts';

import type { ApicraftOption } from '@/bin/schemas';

import { normalizeName } from '../normalizeName';
import { generatePathRequestName } from './generatePathRequestName';

export const generateRequestName = (
  request: IR.OperationObject,
  nameBy: ApicraftOption['nameBy']
) => {
  if (nameBy === 'operationId' && request.operationId) {
    return normalizeName(request.operationId);
  }
  if (nameBy === 'path') {
    return generatePathRequestName(request.method, request.path);
  }

  throw new Error(`Unsupported nameBy option ${nameBy} for ${request.method} ${request.path}`);
};
