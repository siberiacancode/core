import ts from 'typescript';

// import axios from 'axios';
export const getImportAxios = () =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, ts.factory.createIdentifier('axios'), undefined),
    ts.factory.createStringLiteral('axios')
  );
