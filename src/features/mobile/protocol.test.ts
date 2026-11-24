import { describe, expect, it } from 'vitest';

import { decodeBase64Url, encodeBase64Url } from '@/lib/base64url';

import { assertMessages, buildRequestUrl, parseResponseParam, validateCallback, type DappRequestPayload } from './protocol';

const payload: DappRequestPayload = {
  version: 1,
  id: 'req-1',
  method: 'connect',
  callback: 'https://onbloc.github.io/dapp-example/mobile',
  dapp: { name: 'Example 테스트' },
  chainId: 'gnoland-1',
};

describe('base64url', () => {
  it('round-trips UTF-8 without padding or URL-unsafe characters', () => {
    const encoded = encodeBase64Url('{"memo":"한글 ✓ ??>>"}');
    expect(encoded).not.toMatch(/[+/=]/);
    expect(decodeBase64Url(encoded)).toBe('{"memo":"한글 ✓ ??>>"}');
  });
});

describe('buildRequestUrl', () => {
  it('encodes the payload into an adena://request link', () => {
    const url = buildRequestUrl(payload);
    expect(url.startsWith('adena://request?payload=')).toBe(true);
    const encoded = decodeURIComponent(url.split('payload=')[1]);
    expect(JSON.parse(decodeBase64Url(encoded))).toEqual(payload);
  });

  it('rejects payloads above the wallet limit', () => {
    expect(() => buildRequestUrl({ ...payload, dapp: { name: 'x'.repeat(70_000) } })).toThrow(/accepts up to/);
  });
});

describe('validateCallback', () => {
  it.each(['https://example.com/cb', 'https://localhost:5173/mobile', 'https://a.b.c/x?y=1#z'])('accepts %s', url => {
    expect(validateCallback(url)).toBeNull();
  });

  it.each(['http://example.com', 'javascript:alert(1)', 'https://exa\\mple.com', 'https://例え.jp', 'adena://request'])('rejects %s', url => {
    expect(validateCallback(url)).not.toBeNull();
  });
});

describe('parseResponseParam', () => {
  it('decodes a wallet response', () => {
    const response = { requestId: 'req-1', status: 'success', data: { address: 'g1abc' } };
    expect(parseResponseParam(encodeBase64Url(JSON.stringify(response)))).toEqual(response);
  });

  it('rejects malformed responses', () => {
    expect(() => parseResponseParam(encodeBase64Url('{"status":"ok"}'))).toThrow(/Malformed/);
  });
});

describe('assertMessages', () => {
  it('enforces 1..16 messages', () => {
    expect(() => assertMessages([])).toThrow();
    expect(() => assertMessages(Array.from({ length: 17 }, () => ({ type: '/bank.MsgSend', value: {} })))).toThrow(/16/);
    expect(assertMessages([{ type: '/bank.MsgSend', value: {} }])).toHaveLength(1);
  });
});
