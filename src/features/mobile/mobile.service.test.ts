import { beforeEach, describe, expect, it } from 'vitest';

import { historyStore } from '@/features/history/history.store';
import { encodeBase64Url } from '@/lib/base64url';

import { MOBILE_ACTION_GROUPS } from './actions';
import { handleCallback, prepareRequest, recordRequest } from './mobile.service';
import { mobileSessionStore, mobileSettingsStore } from './mobile.store';
import type { DeepLinkAction } from '@/core/action';

const action = (id: string) => MOBILE_ACTION_GROUPS.flatMap(group => group.actions).find(item => item.id === id) as DeepLinkAction;
const encode = (value: unknown) => encodeBase64Url(JSON.stringify(value));

beforeEach(() => {
  historyStore.set([]);
  mobileSessionStore.set(null);
  mobileSettingsStore.set({ callback: 'https://onbloc.github.io/dapp-example/mobile', dappName: 'Test', expiresInMinutes: '10' });
});

describe('mobile deep link flow', () => {
  it('records a pending connect and completes it from the callback, saving the session', () => {
    const connect = action('mobile-connect');
    const prepared = prepareRequest(connect, connect.defaults);
    recordRequest(connect, connect.defaults, prepared);

    expect(historyStore.get()[0]).toMatchObject({ status: 'pending', requestId: prepared.payload.id });

    const result = handleCallback(encode({ requestId: prepared.payload.id, status: 'success', data: { address: 'g1abc', chainId: 'gnoland-1' } }));

    expect(result.entry?.status).toBe('success');
    expect(historyStore.get()).toHaveLength(1);
    expect(mobileSessionStore.get()).toMatchObject({ address: 'g1abc', chainId: 'gnoland-1' });
  });

  it('keeps an unknown response as an unmatched entry without touching the session', () => {
    const result = handleCallback(encode({ requestId: 'req-other', status: 'success', data: { address: 'g1evil' } }));

    expect(result.entry).toBeUndefined();
    expect(historyStore.get()[0]).toMatchObject({ actionId: 'unmatched-callback', requestId: 'req-other' });
    expect(mobileSessionStore.get()).toBeNull();
  });

  it('marks a rejected request as failure', () => {
    const send = action('mobile-send');
    const values = { ...send.defaults, from: 'g1from', to: 'g1to', amount: '1' };
    const prepared = prepareRequest(send, values);
    recordRequest(send, values, prepared);

    handleCallback(encode({ requestId: prepared.payload.id, status: 'failure', error: { code: 'USER_REJECTED', message: 'User rejected the request' } }));

    expect(historyStore.get()[0].status).toBe('failure');
  });

  it('refuses to build a request with a non-https callback', () => {
    mobileSettingsStore.set(prev => ({ ...prev, callback: 'http://localhost:5173/mobile' }));
    const connect = action('mobile-connect');
    expect(() => prepareRequest(connect, connect.defaults)).toThrow(/https/);
  });

  it('builds a send transaction with the fee only when both values are set', () => {
    const send = action('mobile-send');
    const base = { ...send.defaults, from: 'g1from', to: 'g1to', amount: '5', denom: 'ugnot' };

    expect(prepareRequest(send, base).payload.params).toEqual({
      messages: [{ type: '/bank.MsgSend', value: { from_address: 'g1from', to_address: 'g1to', amount: '5ugnot' } }],
      memo: '',
    });
    expect(prepareRequest(send, { ...base, gasWanted: '100000', gasFee: '1000ugnot' }).payload.params).toMatchObject({ gasWanted: '100000', gasFee: '1000ugnot' });
  });

  it('converts a Document and overrides every signer', () => {
    const doc = action('mobile-document');
    const document = JSON.stringify({
      msgs: [{ type: '/vm.m_call', value: { caller: 'g1old', pkg_path: 'gno.land/r/demo/counter', func: 'Increment', args: [], send: '' } }],
      fee: { gas: '200000', amount: [{ amount: '2000', denom: 'ugnot' }] },
      chain_id: 'onyx-1',
      memo: 'hi',
    });
    const { payload } = prepareRequest(doc, { ...doc.defaults, signer: 'g1new', document });

    expect(payload).toMatchObject({ method: 'sign-and-broadcast', chainId: 'onyx-1', params: { memo: 'hi', gasWanted: '200000', gasFee: '2000ugnot' } });
    expect(payload.params?.messages[0].value.caller).toBe('g1new');
  });
});
