import ts from 'typescript';

import type { TanstackPlugin } from '../types';

import { capitalize } from '../../helpers';

interface GetHookDataTypeParams {
  plugin: TanstackPlugin['Instance'];
  requestName: string;
}

// type RequestNameHookData = Awaited<ReturnType<typeof requestName>>;
export const getHookDataType = ({ requestName, plugin }: GetHookDataTypeParams) => {
  const hookDataTypeName = `${capitalize(requestName)}HookData`;

  const requestEntityName =
    plugin.config.groupBy === 'class'
      ? ts.factory.createQualifiedName(
          ts.factory.createIdentifier('instance'),
          ts.factory.createIdentifier(requestName)
        )
      : ts.factory.createIdentifier(requestName);

  const hookDataType = ts.factory.createTypeAliasDeclaration(
    undefined,
    ts.factory.createIdentifier(hookDataTypeName),
    undefined,
    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Awaited'), [
      ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('ReturnType'), [
        ts.factory.createTypeQueryNode(requestEntityName)
      ])
    ])
  );

  return hookDataType;
};
