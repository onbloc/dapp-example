const replacer = (_key: string, value: unknown): unknown => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (value instanceof Uint8Array) {
    return bytesToBase64(value);
  }
  return value;
};

export const stringify = (value: unknown, indent = 2): string =>
  typeof value === 'string' ? value : JSON.stringify(value, replacer, indent) ?? String(value);

// Error own properties (message, stack) are not enumerable, so they are listed explicitly.
export const toSerializableError = (error: unknown): unknown =>
  error instanceof Error ? JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))) : error;

export const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

export const parseJson = <T = unknown>(text: string, field: string): T => {
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${field} is not valid JSON`);
  }
};

// Converts bigint / Uint8Array values so a result can be stored in localStorage.
export const toPlain = (value: unknown): unknown => (value === undefined ? undefined : JSON.parse(JSON.stringify(value, replacer)));
