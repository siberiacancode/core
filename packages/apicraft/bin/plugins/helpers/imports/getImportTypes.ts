import nodePath from 'node:path';
import ts from 'typescript';

import type { ApicraftOption } from '@/bin/schemas';

interface GetImportTypesParams {
  folderPath: string;
  generateOutput: string;
  groupBy: ApicraftOption['groupBy'];
  typeNames: string[];
}

// import type { Type } from 'generated/types.gen';
export const getImportTypes = ({
  typeNames,
  folderPath,
  generateOutput,
  groupBy
}: GetImportTypesParams) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports(
        typeNames.map((name) =>
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))
        )
      )
    ),
    ts.factory.createStringLiteral(
      groupBy === 'paths' || groupBy === 'tags'
        ? nodePath.relative(folderPath, `${generateOutput}/types.gen`)
        : './types.gen'
    ),
    undefined
  );
