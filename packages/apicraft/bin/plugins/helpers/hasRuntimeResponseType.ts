import nodePath from 'node:path';
import ts from 'typescript';

export const hasRuntimeResponseType = (runtimeInstancePath: string): boolean => {
  const filePath =
    nodePath.extname(runtimeInstancePath) === 'ts'
      ? runtimeInstancePath
      : `${runtimeInstancePath}.ts`;

  const program = ts.createProgram([filePath], {});
  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) return false;

  let found = false;

  const visit = (node: ts.Node) => {
    if (
      (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) &&
      node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) &&
      node.name?.text === 'ApicraftApiResponse'
    ) {
      found = true;
      return;
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return found;
};
