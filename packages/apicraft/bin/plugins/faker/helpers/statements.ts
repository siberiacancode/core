import ts from 'typescript';

import type { SchemaRecord } from './types';

import { createCall, createPropertyAccess, identifier } from './ast';
import { buildSchemaExpression, isObjectSchema } from './schema';

export const createStandaloneFunction = ({
  fakerRoot,
  schema,
  schemaMap
}: {
  fakerRoot: ts.Expression;
  schema: SchemaRecord;
  schemaMap: Map<string, SchemaRecord>;
}) => {
  const typeNode = ts.factory.createTypeReferenceNode(identifier(schema.typeName), undefined);
  const generatedExpression = buildSchemaExpression({
    fakerRoot,
    schema: schema.schema,
    schemaMap,
    visitedRefs: new Set()
  });
  const objectSchema = isObjectSchema({
    schema: schema.schema,
    schemaMap,
    visitedRefs: new Set()
  });

  if (objectSchema) {
    return ts.factory.createVariableStatement(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            identifier(schema.functionName),
            undefined,
            undefined,
            ts.factory.createArrowFunction(
              undefined,
              undefined,
              [
                ts.factory.createParameterDeclaration(
                  undefined,
                  undefined,
                  identifier('overrides'),
                  ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                  ts.factory.createTypeReferenceNode(identifier('Partial'), [typeNode]),
                  undefined
                )
              ],
              typeNode,
              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              createCall(
                identifier('deepMerge'),
                [generatedExpression, identifier('overrides')],
                [typeNode]
              )
            )
          )
        ],
        ts.NodeFlags.Const
      )
    );
  }

  return ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          identifier(schema.functionName),
          undefined,
          undefined,
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                identifier('override'),
                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                typeNode,
                undefined
              )
            ],
            typeNode,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createBinaryExpression(
              identifier('override'),
              ts.SyntaxKind.QuestionQuestionToken,
              generatedExpression
            )
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );
};

export const createClassStatements = ({
  defaultFakerIdentifier,
  schemaMap,
  schemas
}: {
  defaultFakerIdentifier: string;
  schemaMap: Map<string, SchemaRecord>;
  schemas: SchemaRecord[];
}) => {
  const methods = schemas.map((schema) => {
    const typeNode = ts.factory.createTypeReferenceNode(identifier(schema.typeName), undefined);
    const fakerRoot = createPropertyAccess(ts.factory.createThis(), 'faker');
    const generatedExpression = buildSchemaExpression({
      fakerRoot,
      schema: schema.schema,
      schemaMap,
      visitedRefs: new Set()
    });
    const objectSchema = isObjectSchema({
      schema: schema.schema,
      schemaMap,
      visitedRefs: new Set()
    });

    if (objectSchema) {
      return ts.factory.createMethodDeclaration(
        undefined,
        undefined,
        identifier(schema.functionName),
        undefined,
        undefined,
        [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            identifier('overrides'),
            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
            ts.factory.createTypeReferenceNode(identifier('Partial'), [typeNode]),
            undefined
          )
        ],
        typeNode,
        ts.factory.createBlock(
          [
            ts.factory.createReturnStatement(
              createCall(
                identifier('deepMerge'),
                [generatedExpression, identifier('overrides')],
                [typeNode]
              )
            )
          ],
          true
        )
      );
    }

    return ts.factory.createMethodDeclaration(
      undefined,
      undefined,
      identifier(schema.functionName),
      undefined,
      undefined,
      [
        ts.factory.createParameterDeclaration(
          undefined,
          undefined,
          identifier('override'),
          ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          typeNode,
          undefined
        )
      ],
      typeNode,
      ts.factory.createBlock(
        [
          ts.factory.createReturnStatement(
            ts.factory.createBinaryExpression(
              identifier('override'),
              ts.SyntaxKind.QuestionQuestionToken,
              generatedExpression
            )
          )
        ],
        true
      )
    );
  });

  return [
    ts.factory.createClassDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      identifier('FakerInstance'),
      undefined,
      undefined,
      [
        ts.factory.createConstructorDeclaration(
          undefined,
          [
            ts.factory.createParameterDeclaration(
              [
                ts.factory.createModifier(ts.SyntaxKind.PrivateKeyword),
                ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)
              ],
              undefined,
              identifier('faker'),
              undefined,
              ts.factory.createTypeReferenceNode(identifier('Faker'), undefined),
              identifier(defaultFakerIdentifier)
            )
          ],
          ts.factory.createBlock([], true)
        ),
        ...methods
      ]
    ),
    ts.factory.createVariableStatement(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            identifier('instance'),
            undefined,
            undefined,
            ts.factory.createNewExpression(identifier('FakerInstance'), undefined, [])
          )
        ],
        ts.NodeFlags.Const
      )
    )
  ];
};
