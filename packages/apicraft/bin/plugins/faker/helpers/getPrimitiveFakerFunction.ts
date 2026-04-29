import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import { getFakerValue } from './getFakerValue';

interface GetPrimitiveFakerFunctionParams {
  schema: IR.SchemaObject;
  schemaName: string;
  typeName: string;
}

// export const createTypeName = (overrides?: TypeName): TypeName => overrides ?? faker
export const getPrimitiveFakerFunction = ({
  schema,
  schemaName,
  typeName
}: GetPrimitiveFakerFunctionParams) =>
  ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(`create${typeName}`),
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
              schema.type === 'array'
                ? ts.factory.createArrayLiteralExpression(
                    [getFakerValue(schemaName, schema.items![0])],
                    false
                  )
                : getFakerValue(schemaName, schema)
            )
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );
