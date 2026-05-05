import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import { getFakerFunctionName } from './getFakerFunctionName';
import { getFakerValue } from './getFakerValue';

interface GetArrayFakerFunctionParams {
  schema: IR.SchemaObject;
  schemaName: string;
  typeName: string;
}

// export const createTypeName = (overrides?: TypeName): TypeName => overrides ?? [{...}]
export const getArrayObjectFakerFunction = ({
  schema,
  schemaName,
  typeName
}: GetArrayFakerFunctionParams) =>
  ts.factory.createVariableStatement(
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
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier(typeName),
                  undefined
                ),
                undefined
              )
            ],
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(typeName), undefined),
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createBinaryExpression(
              ts.factory.createIdentifier('overrides'),
              ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
              ts.factory.createArrayLiteralExpression(
                schema.items![0].properties
                  ? [
                      ts.factory.createObjectLiteralExpression(
                        Object.entries(schema.items![0].properties).map(([propName, propSchema]) =>
                          ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier(propName),
                            getFakerValue(propName, propSchema)
                          )
                        ),
                        true
                      )
                    ]
                  : [getFakerValue(schemaName, schema.items![0])],
                false
              )
            )
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );
