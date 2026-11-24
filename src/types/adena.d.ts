// Subset of the injected Adena provider used by the examples.
interface AdenaResponse<T = unknown> {
  code: number;
  status: 'success' | 'failure';
  type: string;
  message: string;
  data: T;
}

interface AdenaCosmos {
  enable(chainIds: string | string[]): Promise<AdenaResponse>;
  getKey(chainId: string): Promise<AdenaResponse<{ bech32Address: string; pubKey: Uint8Array; address: Uint8Array; algo: string; name: string }>>;
  signDirect(chainId: string, signer: string, signDoc: unknown): Promise<AdenaResponse<{ signed: Record<string, unknown>; signature: unknown }>>;
  signAmino(chainId: string, signer: string, signDoc: unknown): Promise<AdenaResponse>;
  sendTx(chainId: string, txBytes: Uint8Array, mode: string): Promise<AdenaResponse>;
  getOfflineSignerAuto(chainId: string): Promise<import('@cosmjs/proto-signing').OfflineSigner>;
}

interface AdenaProvider {
  AddEstablish(siteName: string, chainIds?: string[]): Promise<AdenaResponse>;
  GetAccount(): Promise<AdenaResponse<{ address: string; chainId: string; publicKey?: unknown }>>;
  DoContract(params: { messages: unknown[]; gasFee: number; gasWanted: number; memo?: string }): Promise<AdenaResponse>;
  SwitchNetwork(chainId: string): Promise<AdenaResponse>;
  cosmos?: AdenaCosmos;
}

interface Window {
  adena?: AdenaProvider;
}
