import nodePath from 'node:path';
import ts from 'typescript';

interface GetImportRequestParams {
  folderPath: string;
  generateOutput: string;
  requestFilePath: string;
  requestName: string;
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
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(requestName))
      ])
    ),
    ts.factory.createStringLiteral(
      nodePath.relative(folderPath, `${generateOutput}/${requestFilePath}.gen`)
    )
  );
