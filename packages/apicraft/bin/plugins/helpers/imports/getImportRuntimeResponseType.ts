import ts from 'typescript';

import { getRelativePath } from '../getRelativePath';

interface GetImportRuntimeResponseTypeParams {
  folderPath: string;
  runtimeInstancePath: string;
}

// import type { ApicraftApiResponse } from runtimeInstancePath;
export const getImportRuntimeResponseType = ({
  folderPath,
  runtimeInstancePath
}: GetImportRuntimeResponseTypeParams) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('ApicraftApiResponse')
        )
      ])
    ),
    ts.factory.createStringLiteral(getRelativePath(folderPath, runtimeInstancePath))
  );
