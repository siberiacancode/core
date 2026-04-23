import ts from 'typescript';

import { stringLiteral } from './ast';

export const createImport = ({
  isTypeOnly,
  module,
  specifiers
}: {
  isTypeOnly?: boolean;
  module: string;
  specifiers: ts.ImportSpecifier[];
}) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      !!isTypeOnly,
      undefined,
      ts.factory.createNamedImports(specifiers)
    ),
    stringLiteral(module),
    undefined
  );
