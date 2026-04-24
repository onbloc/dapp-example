export const bigintReplacer = (_key, value) =>
  typeof value === 'bigint' ? value.toString() : value;

export const stringify = (obj, indent = 2) =>
  JSON.stringify(obj, bigintReplacer, indent);
