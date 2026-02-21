import nodePath from 'node:path';
import ts from 'typescript';

interface GetImportRequestParams {
  hookFolderPath: string;
  requestFilePath: string;
  requestName: string;
}

// import type { requestName } from './requestName.gen';
export const getImportRequest = ({
  hookFolderPath,
  requestFilePath,
  requestName
}: GetImportRequestParams) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(requestName))
      ])
    ),
    ts.factory.createStringLiteral(nodePath.relative(hookFolderPath, `${requestFilePath}.gen`))
  );
