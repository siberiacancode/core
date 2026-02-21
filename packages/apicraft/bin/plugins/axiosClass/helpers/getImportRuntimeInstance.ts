import nodePath from 'node:path';
import ts from 'typescript';

interface GetImportRuntimeInstanceParams {
  folderPath: string;
  runtimeInstancePath: string;
}

// import { instance as runtimeInstance } from runtimeInstancePath;
export const getImportRuntimeInstance = ({
  folderPath,
  runtimeInstancePath
}: GetImportRuntimeInstanceParams) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          ts.factory.createIdentifier('instance'),
          ts.factory.createIdentifier('runtimeInstance')
        )
      ])
    ),
    ts.factory.createStringLiteral(nodePath.relative(folderPath, runtimeInstancePath)),
    undefined
  );
