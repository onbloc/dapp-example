import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { ActionGroups, GroupNav } from '@/features/actions/ActionGroups';
import { stringify } from '@/lib/json';
import { isMobileDevice } from '@/lib/platform';
import { useStore } from '@/lib/use-store';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { CodeBlock } from '@/ui/CodeBlock';
import { CloseIcon } from '@/ui/icons';

import { MOBILE_ACTION_GROUPS } from './actions';
import { handleCallback, type CallbackResult } from './mobile.service';
import { defaultCallback, mobileSessionStore, mobileSettingsStore, type MobileSettings } from './mobile.store';
import { RESPONSE_PARAM, validateCallback } from './protocol';

// Reads `?response=` once, records it, and strips it from the URL so a reload does not replay it.
const useWalletCallback = () => {
  const [params, setParams] = useSearchParams();
  const [result, setResult] = useState<CallbackResult | { error: string } | null>(null);
  const encoded = params.get(RESPONSE_PARAM);
  // StrictMode runs effects twice in development; a response must be recorded once.
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!encoded || handled.current === encoded) {
      return;
    }
    handled.current = encoded;
    try {
      setResult(handleCallback(encoded));
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : String(error) });
    }
    setParams(
      prev => {
        prev.delete(RESPONSE_PARAM);
        return prev;
      },
      { replace: true },
    );
  }, [encoded, setParams]);

  return [result, () => setResult(null)] as const;
};

const CallbackBanner = ({ result, onDismiss }: { result: CallbackResult | { error: string }; onDismiss: () => void }) => {
  const failed = 'error' in result || result.response.status === 'failure';
  const title = 'error' in result ? 'Could not read the wallet response' : `${result.entry?.title ?? 'Unmatched request'} · ${result.response.status}`;

  return (
    <div className={`callback ${failed ? 'callback-failure' : 'callback-success'}`} role="status">
      <div className="callback-header">
        <strong>{title}</strong>
        <Button variant="ghost" size="sm" icon={<CloseIcon />} onClick={onDismiss} aria-label="Dismiss" />
      </div>
      {'error' in result ? <p>{result.error}</p> : <CodeBlock title="Wallet response" code={stringify(result.response)} tone={result.response.status} />}
      {'response' in result && !result.entry && <p className="hint">This response does not match a request sent from this browser.</p>}
    </div>
  );
};

const SessionCard = () => {
  const session = useStore(mobileSessionStore);

  return (
    <article className="card compact">
      <header className="card-header">
        <div>
          <h3>Connected account</h3>
          <p>Saved from the last successful Connect response.</p>
        </div>
        <Badge tone={session ? 'success' : 'neutral'}>{session ? 'connected' : 'not connected'}</Badge>
      </header>
      {session ? (
        <>
          <dl className="kv">
            <dt>Address</dt>
            <dd className="mono">{session.address}</dd>
            <dt>Chain ID</dt>
            <dd className="mono">{session.chainId ?? '-'}</dd>
          </dl>
          <div className="card-actions">
            <Button size="sm" variant="ghost" onClick={() => mobileSessionStore.set(null)}>
              Forget account
            </Button>
          </div>
        </>
      ) : (
        <p className="empty">Run Connect below. The wallet returns here with the address.</p>
      )}
    </article>
  );
};

const SettingsCard = () => {
  const settings = useStore(mobileSettingsStore);
  const callbackError = validateCallback(settings.callback);
  const update = (patch: Partial<MobileSettings>) => mobileSettingsStore.set(prev => ({ ...prev, ...patch }));

  return (
    <article className="card compact">
      <header className="card-header">
        <div>
          <h3>Request settings</h3>
          <p>Applied to every deep link. The wallet sends its response to the callback URL.</p>
        </div>
      </header>
      <div className="fields">
        <div className="field">
          <label htmlFor="callback">Callback URL</label>
          <div className="input-group">
            <input id="callback" className="input mono" value={settings.callback} spellCheck={false} onChange={event => update({ callback: event.target.value })} />
            <Button size="sm" variant="ghost" onClick={() => update({ callback: defaultCallback() })}>
              This page
            </Button>
          </div>
          {callbackError && <small className="inline-error">{callbackError}. Use <code>npm run dev:https</code> or the deployed page.</small>}
        </div>
        <div className="field">
          <label htmlFor="dapp-name">dApp name</label>
          <input id="dapp-name" className="input" value={settings.dappName} maxLength={64} onChange={event => update({ dappName: event.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="expires">Expires in (min)</label>
          <input id="expires" className="input mono" inputMode="numeric" value={settings.expiresInMinutes} placeholder="0 = no expiry" onChange={event => update({ expiresInMinutes: event.target.value })} />
        </div>
      </div>
    </article>
  );
};

export const MobilePage = () => {
  const [callback, dismiss] = useWalletCallback();

  return (
    <div className="page">
      <section className="hero">
        <Badge tone="accent">adena://request · protocol v1</Badge>
        <h1>Mobile app</h1>
        <p>
          Sends requests to Adena Mobile through deep links. The wallet answers by opening the callback URL with <code>?response=</code>; pending requests are saved in
          the history and completed when the response arrives.
        </p>
      </section>

      {callback && <CallbackBanner result={callback} onDismiss={dismiss} />}

      {!isMobileDevice() && <div className="notice">You are on a desktop browser. Use the QR button on a request to open it on a phone with Adena Mobile installed.</div>}

      <div className="layout">
        <GroupNav groups={MOBILE_ACTION_GROUPS} />
        <div className="content">
          <div className="grid">
            <SessionCard />
            <SettingsCard />
          </div>
          <ActionGroups groups={MOBILE_ACTION_GROUPS} />
        </div>
      </div>
    </div>
  );
};
