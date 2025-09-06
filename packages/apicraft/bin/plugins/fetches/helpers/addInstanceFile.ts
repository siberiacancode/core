import ts from 'typescript';

export const addInstanceFile = (plugin: any) => {
  const instanceFile = plugin.createFile({
    id: 'fetchesInstance',
    path: `${plugin.output}/instance`
  });

  const importFetches = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, ts.factory.createIdentifier('fetches'), undefined),
    ts.factory.createStringLiteral('@siberiacancode/fetches')
  );

  const createInstance = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier('instance'),
          undefined,
          undefined,
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('fetches'),
              ts.factory.createIdentifier('create')
            ),
            undefined,
            [
              ts.factory.createObjectLiteralExpression(
                [
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier('baseURL'),
                    ts.factory.createStringLiteral('/')
                  )
                ],
                true
              )
            ]
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  instanceFile.add(importFetches);
  instanceFile.add(createInstance);
};
