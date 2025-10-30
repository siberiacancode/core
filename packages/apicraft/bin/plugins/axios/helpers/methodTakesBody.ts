export const methodTakesBody = (m: string) => /^(?:post|put|patch)$/i.test(m);
