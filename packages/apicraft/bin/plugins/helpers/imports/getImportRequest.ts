import ts from 'typescript';

import { getRelativePath } from '../getRelativePath';

interface GetImportRequestParams {
  folderPath: string;
  generateOutput: string;
  requestFilePath: string;
  requestName: string | string[];
}

// import type { requestName } from './requestName.gen';
export const getImportRequest = ({
  folderPath,
  requestFilePath,
  requestName,
  generateOutput
}: GetImportRequestParams) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ...(Array.isArray(requestName) ? requestName : [requestName]).map((name) =>
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))
        )
      ])
    ),
    ts.factory.createStringLiteral(
      getRelativePath(folderPath, `${generateOutput}/${requestFilePath}.gen`)
    )
  );
