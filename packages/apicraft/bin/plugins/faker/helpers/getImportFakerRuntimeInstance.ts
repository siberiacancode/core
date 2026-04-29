import ts from 'typescript';

import { getRelativePath } from '@/bin/plugins/helpers';

interface GetImportRuntimeInstanceParams {
  folderPath: string;
  runtimeInstancePath: string;
}

// import { faker } from runtimeInstancePath;
export const getImportFakerRuntimeInstance = ({
  folderPath,
  runtimeInstancePath
}: GetImportRuntimeInstanceParams) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('faker'))
      ])
    ),
    ts.factory.createStringLiteral(getRelativePath(folderPath, runtimeInstancePath)),
    undefined
  );
