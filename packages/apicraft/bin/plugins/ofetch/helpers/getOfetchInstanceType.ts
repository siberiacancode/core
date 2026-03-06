import ts from 'typescript';

// interface Instance extends $Fetch { <T = any>(request, options?): Promise<T> }
export const getOfetchInstanceType = () =>
  ts.factory.createInterfaceDeclaration(
    undefined,
    ts.factory.createIdentifier('Instance'),
    undefined,
    [
      ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.factory.createExpressionWithTypeArguments(
          ts.factory.createIdentifier('$Fetch'),
          undefined
        )
      ])
    ],
    [
      ts.factory.createCallSignature(
        [
          ts.factory.createTypeParameterDeclaration(
            undefined,
            ts.factory.createIdentifier('T'),
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
          )
        ],
        [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            ts.factory.createIdentifier('request'),
            undefined,
            ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier('FetchRequest'),
              undefined
            ),
            undefined
          ),
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            ts.factory.createIdentifier('options'),
            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('FetchOptions'), [
              ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier('ResponseType'),
                undefined
              )
            ]),
            undefined
          )
        ],
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Promise'), [
          ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('T'), undefined)
        ])
      )
    ]
  );
