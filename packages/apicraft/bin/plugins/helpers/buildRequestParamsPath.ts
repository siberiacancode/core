import ts from 'typescript';

export function buildRequestParamsPath(path: string) {
  const parts = path.split(/\{([^}]+)\}/g);
  const head = ts.factory.createTemplateHead(parts[0]);
  const spans: ts.TemplateSpan[] = [];

  for (let i = 1; i < parts.length; i += 2) {
    const accessExpression = ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier('path'),
      parts[i]
    );

    const isLastParam = i + 2 >= parts.length;
    const literal = isLastParam
      ? ts.factory.createTemplateTail(parts[i + 1])
      : ts.factory.createTemplateMiddle(parts[i + 1]);

    spans.push(ts.factory.createTemplateSpan(accessExpression, literal));
  }

  return ts.factory.createTemplateExpression(head, spans);
}
