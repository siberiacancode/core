import nodePath from 'node:path';
import ts from 'typescript';

interface GetImportInstanceParams {
  folderPath: string;
  generateOutput: string;
  output: string;
  runtimeInstancePath?: string;
}

// import { instance } from '../../instance.gen';
export const getImportInstance = ({
  output,
  generateOutput,
  runtimeInstancePath,
  folderPath
}: GetImportInstanceParams) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('instance'))
      ])
    ),
    ts.factory.createStringLiteral(
      nodePath.relative(
        folderPath,
        runtimeInstancePath ?? nodePath.normalize(`${generateOutput}/${output}/instance.gen`)
      )
    )
  );
