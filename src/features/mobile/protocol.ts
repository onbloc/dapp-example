import { decodeBase64Url, encodeBase64Url } from '@/lib/base64url';

// Adena Mobile deep link protocol v1 (packages/adena-mobile/src/deeplink/dapp-protocol.ts).
//   Request:  adena://request?payload=<base64url(JSON RequestPayload)>
//   Response: <callback>?response=<base64url(JSON DappResponse)>
export const PROTOCOL_VERSION = 1;
export const DEEP_LINK_PREFIX = 'adena://request';
export const RESPONSE_PARAM = 'response';
export const MAX_PAYLOAD_BYTES = 64 * 1024;
export const MAX_MESSAGES = 16;

export type DappMethod = 'connect' | 'sign-transaction' | 'sign-and-broadcast';

export interface GnoMessage {
  type: string;
  value: Record<string, unknown>;
}

export interface TransactionParams {
  messages: GnoMessage[];
  memo?: string;
  gasWanted?: string;
  gasFee?: string;
}

// The part each action decides; id, callback and dApp metadata are added by `buildRequest`.
export interface DappRequestBody {
  method: DappMethod;
  chainId?: string;
  params?: TransactionParams;
}

export interface DappRequestPayload extends DappRequestBody {
  version: number;
  id: string;
  callback: string;
  dapp: { name: string; url?: string; icon?: string };
  expiresAt?: number;
}

export interface DappResponse {
  requestId: string;
  status: 'success' | 'failure';
  data?: Record<string, unknown>;
  error?: { code: string; message: string };
}

export const buildRequestUrl = (payload: DappRequestPayload): string => {
  const encoded = encodeBase64Url(JSON.stringify(payload));

  if (encoded.length > MAX_PAYLOAD_BYTES) {
    throw new Error(`Payload is ${encoded.length} bytes; the wallet accepts up to ${MAX_PAYLOAD_BYTES}`);
  }

  return `${DEEP_LINK_PREFIX}?payload=${encodeURIComponent(encoded)}`;
};

// Mirrors the wallet's callback check so a rejected callback is reported before leaving the page.
export const validateCallback = (callback: string): string | null => {
  if (!/^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*(?::\d{1,5})?(?:[/?#]|$)/i.test(callback)) {
    return 'The wallet only calls back to https URLs with a plain ASCII host';
  }
  return null;
};

export const parseResponseParam = (encoded: string): DappResponse => {
  const response = JSON.parse(decodeBase64Url(encoded)) as DappResponse;

  if (!response || typeof response.requestId !== 'string' || (response.status !== 'success' && response.status !== 'failure')) {
    throw new Error('Malformed wallet response');
  }

  return response;
};

export const assertMessages = (messages: unknown): GnoMessage[] => {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages must be a non-empty array');
  }
  if (messages.length > MAX_MESSAGES) {
    throw new Error(`The wallet accepts up to ${MAX_MESSAGES} messages`);
  }
  return messages as GnoMessage[];
};
