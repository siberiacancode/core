import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import { getFakerFunctionName } from './getFakerFunctionName';
import { getFakerObjectPropName } from './getFakerObjectPropName';
import { getFakerValue } from './getFakerValue';

interface GetNullableObjectFakerFunctionParams {
  schema: IR.SchemaObject;
  schemaName: string;
  typeName: string;
}

// export const createTypeName = (overrides?: Partial<NonNullable<TypeName>> | null): TypeName =>
//   overrides === null ? null : deepMerge<NonNullable<TypeName>>({...}, overrides)
export const getNullableObjectFakerFunction = ({
  schema,
  schemaName,
  typeName
}: GetNullableObjectFakerFunctionParams) => {
  const nonNullableType = () =>
    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('NonNullable'), [
      ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(typeName), undefined)
    ]);

  return ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(getFakerFunctionName(typeName)),
          undefined,
          undefined,
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                ts.factory.createIdentifier('overrides'),
                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                ts.factory.createUnionTypeNode([
                  ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Partial'), [
                    nonNullableType()
                  ]),
                  ts.factory.createLiteralTypeNode(ts.factory.createNull())
                ]),
                undefined
              )
            ],
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(typeName), undefined),
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createConditionalExpression(
              ts.factory.createBinaryExpression(
                ts.factory.createIdentifier('overrides'),
                ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                ts.factory.createNull()
              ),
              ts.factory.createToken(ts.SyntaxKind.QuestionToken),
              ts.factory.createNull(),
              ts.factory.createToken(ts.SyntaxKind.ColonToken),
              ts.factory.createCallExpression(
                ts.factory.createIdentifier('deepMerge'),
                [nonNullableType()],
                schema.properties
                  ? [
                      ts.factory.createObjectLiteralExpression(
                        Object.entries(schema.properties).map(([propName, propSchema]) =>
                          ts.factory.createPropertyAssignment(
                            getFakerObjectPropName(propName),
                            getFakerValue(propName, propSchema)
                          )
                        ),
                        true
                      ),
                      ts.factory.createIdentifier('overrides')
                    ]
                  : [getFakerValue(schemaName, schema), ts.factory.createIdentifier('overrides')]
              )
            )
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );
};
