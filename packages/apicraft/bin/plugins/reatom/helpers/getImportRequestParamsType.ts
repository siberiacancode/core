import nodePath from 'node:path';
import ts from 'typescript';

import { getRelativePath } from '@/bin/plugins/helpers';

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
      getRelativePath(
        folderPath,
        runtimeInstancePath ?? nodePath.normalize(`${generateOutput}/${output}/instance.gen`)
      )
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
      getRelativePath(
        params.folderPath,
        params.runtimeInstancePath ??
          nodePath.normalize(`${params.generateOutput}/${params.output}/instance.gen`)
      )
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
      getRelativePath(folderPath, `${generateOutput}/${requestFilePath}.gen`)
    )
  );

interface GetImportRequestParamsTypesFromRequestFileParams {
  folderPath: string;
  generateOutput: string;
  requestFilePath: string;
  requestParamsTypeNames: string[];
}

/** Import types from request file (standalone mode) */
export const getImportRequestParamsTypesFromRequestFile = ({
  folderPath,
  generateOutput,
  requestFilePath,
  requestParamsTypeNames
}: GetImportRequestParamsTypesFromRequestFileParams) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports(
        requestParamsTypeNames.map((name) =>
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))
        )
      )
    ),
    ts.factory.createStringLiteral(
      getRelativePath(folderPath, `${generateOutput}/${requestFilePath}.gen`)
    )
  );
