import { capitalize } from './capitalize';
import { normalizeName } from './normalizeName';

const RESERVED_TYPE_IDENTIFIER_PATTERNS = [
  /^(arguments|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|eval|export|extends|false|finally|for|from|function|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)$/,
  /^(any|as|bigint|boolean|namespace|never|null|number|string|symbol|type|undefined|unknown|void)$/,
  /^(console|Array|Date|Error|Function|JSON|Map|Math|Object|Promise|RegExp|Set|WeakMap|WeakSet)$/,
  /^(global|process|Buffer)$/,
  /^(document|history|location|navigator|window)$/
];

export const getSchemaTypeName = (name: string) => {
  const typeName = capitalize(normalizeName(name));

  if (!typeName || RESERVED_TYPE_IDENTIFIER_PATTERNS.some((pattern) => pattern.test(typeName))) {
    return `_${typeName}`;
  }

  return typeName;
};
