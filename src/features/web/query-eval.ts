// Evaluates a read-only realm expression through the RPC `vm/qeval` ABCI query.
export const queryEval = async (rpcUrl: string, pkgPath: string, func: string, args: string): Promise<unknown> => {
  const base = /^https?:\/\//.test(rpcUrl) ? rpcUrl.replace(/\/+$/, '') : `https://${rpcUrl}`;
  const data = btoa(`${pkgPath}.${func}(${args})`);
  const response = await fetch(`${base}/abci_query?path="vm/qeval"&data="${data}"`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const body = await response.json();
  const encoded: string | undefined = body?.result?.response?.ResponseBase?.Data;

  if (!encoded) {
    const base = body?.result?.response?.ResponseBase;
    if (base?.Error) {
      throw new Error(base.Log || JSON.stringify(base.Error));
    }
    return body;
  }

  return { raw: atob(encoded), decoded: tryDecodeJson(atob(encoded)) };
};

// qeval returns `("<json string>" string)`; unwrap it when the realm returns JSON.
const tryDecodeJson = (expression: string): unknown => {
  const match = /^\((".*")\s+string\)$/s.exec(expression.trim());
  if (!match) {
    return undefined;
  }
  try {
    return JSON.parse(JSON.parse(match[1]));
  } catch {
    return undefined;
  }
};
