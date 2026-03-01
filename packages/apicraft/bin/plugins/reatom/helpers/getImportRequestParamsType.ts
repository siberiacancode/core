import nodePath from 'node:path';
import ts from 'typescript';

interface GetImportRequestParamsTypeParams {
  folderPath: string;
  generateOutput: string;
  output: string;
  requestParamsTypeName: string;
  runtimeInstancePath?: string;
}

/** Import type from instance.gen (class mode) */
export const getImportRequestParamsType = ({
  folderPath,
  generateOutput,
  output,
  requestParamsTypeName,
  runtimeInstancePath
}: GetImportRequestParamsTypeParams) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier(requestParamsTypeName)
        )
      ])
    ),
    ts.factory.createStringLiteral(
      nodePath
        .relative(
          folderPath,
          runtimeInstancePath ?? nodePath.normalize(`${generateOutput}/${output}/instance.gen`)
        )
        .replace(/\\/g, '/')
    )
  );

export const getImportRequestParamsTypes = (params: {
  folderPath: string;
  generateOutput: string;
  output: string;
  requestParamsTypeNames: string[];
  runtimeInstancePath?: string;
}) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports(
        params.requestParamsTypeNames.map((name) =>
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))
        )
      )
    ),
    ts.factory.createStringLiteral(
      nodePath
        .relative(
          params.folderPath,
          params.runtimeInstancePath ??
            nodePath.normalize(`${params.generateOutput}/${params.output}/instance.gen`)
        )
        .replace(/\\/g, '/')
    )
  );

interface GetImportRequestParamsTypeFromRequestFileParams {
  folderPath: string;
  generateOutput: string;
  requestFilePath: string;
  requestParamsTypeName: string;
}

/** Import type from request file (composed mode) */
export const getImportRequestParamsTypeFromRequestFile = ({
  folderPath,
  generateOutput,
  requestFilePath,
  requestParamsTypeName
}: GetImportRequestParamsTypeFromRequestFileParams) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier(requestParamsTypeName)
        )
      ])
    ),
    ts.factory.createStringLiteral(
      nodePath.relative(folderPath, `${generateOutput}/${requestFilePath}.gen`).replace(/\\/g, '/')
    )
  );
