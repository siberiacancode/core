import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import { getFakerFunctionName } from './getFakerFunctionName';
import { getFakerValue } from './getFakerValue';

interface GetPrimitiveFakerFunctionParams {
  schema: IR.SchemaObject;
  schemaName: string;
  typeName: string;
}

// export const createTypeName = (overrides?: Partial<TypeName>): TypeName => deepMerge<TypeName>({...}, overrides)
export const getObjectFakerFunction = ({
  schema,
  schemaName,
  typeName
}: GetPrimitiveFakerFunctionParams) =>
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
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Partial'), [
                  ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier(typeName),
                    undefined
                  )
                ]),
                undefined
              )
            ],
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(typeName), undefined),
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createCallExpression(
              ts.factory.createIdentifier('deepMerge'),
              [
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(typeName), undefined)
              ],
              schema.properties
                ? [
                    ts.factory.createObjectLiteralExpression(
                      Object.entries(schema.properties ?? {}).map(([propName, propSchema]) =>
                        ts.factory.createPropertyAssignment(
                          ts.factory.createIdentifier(propName),
                          getFakerValue(propName, propSchema)
                        )
                      ),
                      true
                    ),
                    ts.factory.createIdentifier('overrides')
                  ]
                : [getFakerValue(schemaName, schema)]
            )
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );
