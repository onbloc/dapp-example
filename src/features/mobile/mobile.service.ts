import type { DeepLinkAction, FormValues } from '@/core/action';
import { addHistory, findHistoryByRequestId, updateHistory, type HistoryEntry } from '@/features/history/history.store';
import { createId } from '@/lib/id';

import { mobileSessionStore, mobileSettingsStore } from './mobile.store';
import { buildRequestUrl, parseResponseParam, validateCallback, type DappRequestPayload, type DappResponse } from './protocol';

export interface PreparedRequest {
  payload: DappRequestPayload;
  url: string;
}

export const prepareRequest = (action: DeepLinkAction, values: FormValues): PreparedRequest => {
  const settings = mobileSettingsStore.get();
  const callbackError = validateCallback(settings.callback);

  if (callbackError) {
    throw new Error(`${callbackError}. Update the callback URL in Settings.`);
  }

  const minutes = Number(settings.expiresInMinutes);
  const appUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;
  const payload: DappRequestPayload = {
    version: 1,
    id: createId('req'),
    callback: settings.callback,
    dapp: { name: settings.dappName || 'Adena dApp Example', url: appUrl, icon: `${appUrl}favicon.svg` },
    ...(minutes > 0 ? { expiresAt: Date.now() + minutes * 60_000 } : {}),
    ...action.build(values),
  };

  return { payload, url: buildRequestUrl(payload) };
};

// Records the request before leaving the page so the callback can be matched when the wallet returns.
export const recordRequest = (action: DeepLinkAction, values: FormValues, prepared: PreparedRequest): HistoryEntry =>
  addHistory({
    platform: 'mobile',
    actionId: action.id,
    title: action.title,
    values,
    status: 'pending',
    requestId: prepared.payload.id,
    request: prepared.payload,
  });

export interface CallbackResult {
  response: DappResponse;
  entry?: HistoryEntry;
}

export const handleCallback = (encoded: string): CallbackResult => {
  const response = parseResponseParam(encoded);
  const pending = findHistoryByRequestId(response.requestId);
  const status = response.status;

  if (pending) {
    updateHistory(pending.id, { status, result: response, completedAt: Date.now() });
  } else {
    // Not sent from this browser (e.g. the link was opened on another device): keep it, flagged as unmatched.
    addHistory({
      platform: 'mobile',
      actionId: 'unmatched-callback',
      title: 'Unmatched wallet response',
      values: {},
      status,
      requestId: response.requestId,
      result: response,
      completedAt: Date.now(),
    });
  }

  const request = pending?.request as DappRequestPayload | undefined;
  const address = response.data?.address;

  if (status === 'success' && request?.method === 'connect' && typeof address === 'string') {
    mobileSessionStore.set({
      address,
      publicKey: response.data?.publicKey,
      chainId: typeof response.data?.chainId === 'string' ? response.data.chainId : request.chainId,
      connectedAt: Date.now(),
    });
  }

  return { response, entry: pending ? findHistoryByRequestId(response.requestId) : undefined };
};
