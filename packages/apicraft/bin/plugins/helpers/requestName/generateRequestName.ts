import type { IR } from '@hey-api/openapi-ts';

import type { ApicraftOption } from '@/bin/schemas';

import { lowercase } from '../lowercase';
import { generatePathRequestName } from './generatePathRequestName';
import { normalizeRequestName } from './normalizeRequestName';

export const generateRequestName = (
  request: IR.OperationObject,
  nameBy: ApicraftOption['nameBy']
) => {
  if (nameBy === 'operationId' && request.operationId) {
    return lowercase(normalizeRequestName(request.operationId));
  }
  if (nameBy === 'path') {
    return generatePathRequestName(request.method, request.path);
  }

  throw new Error(`Unsupported nameBy option ${nameBy} for ${request.method} ${request.path}`);
};
