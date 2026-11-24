import { useCallback, useMemo, useState } from 'react';

import type { ActionDef, FormValues } from '@/core/action';
import { addHistory, updateHistory, type HistoryStatus } from '@/features/history/history.store';
import { usePrefill } from '@/features/history/prefill.store';
import { prepareRequest, recordRequest } from '@/features/mobile/mobile.service';
import { mobileSettingsStore } from '@/features/mobile/mobile.store';
import { stringify, toPlain, toSerializableError } from '@/lib/json';
import { useStore } from '@/lib/use-store';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { CodeBlock } from '@/ui/CodeBlock';
import { CopyButton } from '@/ui/CopyButton';
import { Field } from '@/ui/Field';
import { ExternalIcon, PlayIcon, QrIcon } from '@/ui/icons';

import { QrCode } from './QrCode';
import { TemplatePanel } from './TemplatePanel';

interface Outcome {
  status: HistoryStatus;
  data: unknown;
}

// Provider responses resolve with { status: 'failure' } instead of throwing.
const statusOf = (result: unknown): HistoryStatus =>
  result && typeof result === 'object' && (result as { status?: unknown }).status === 'failure' ? 'failure' : 'success';

export const ActionCard = ({ action }: { action: ActionDef }) => {
  const [values, setValues] = useState<FormValues>(action.defaults);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const settings = useStore(mobileSettingsStore);

  usePrefill(action.id, useCallback((next: FormValues) => setValues({ ...action.defaults, ...next }), [action.defaults]));

  const setField = (name: string, value: string) => {
    const field = action.fields.find(item => item.name === name);
    setValues(prev => {
      const next = { ...prev, [name]: value };
      return { ...next, ...field?.onChange?.(value, next) } as FormValues;
    });
  };

  const fail = (error: unknown) => setOutcome({ status: 'failure', data: toSerializableError(error) });

  // A deep link is rebuilt on every edit so the preview, copy and QR always match the inputs.
  const prepared = useMemo(() => {
    if (action.kind !== 'deeplink') {
      return null;
    }
    try {
      return { ok: true as const, ...prepareRequest(action, values) };
    } catch (error) {
      return { ok: false as const, error: error instanceof Error ? error.message : String(error) };
    }
  }, [action, values, settings]);

  const invoke = async () => {
    if (action.kind !== 'invoke') {
      return;
    }
    setBusy(true);
    const entry = addHistory({ platform: 'web', actionId: action.id, title: action.title, values, status: 'pending' });
    try {
      const result = toPlain(await action.run(values));
      const status = statusOf(result);
      setOutcome({ status, data: result });
      updateHistory(entry.id, { status, result, completedAt: Date.now() });
    } catch (error) {
      const result = toSerializableError(error);
      setOutcome({ status: 'failure', data: result });
      updateHistory(entry.id, { status: 'failure', result, completedAt: Date.now() });
    } finally {
      setBusy(false);
    }
  };

  const openDeepLink = () => {
    if (action.kind !== 'deeplink') {
      return;
    }
    try {
      // A fresh request id per launch, so a callback matches exactly one history entry.
      const request = prepareRequest(action, values);
      recordRequest(action, values, request);
      setOutcome({ status: 'pending', data: 'Waiting for the wallet to call back…' });
      window.location.href = request.url;
    } catch (error) {
      fail(error);
    }
  };

  return (
    <article className="card" id={`action-${action.id}`}>
      <header className="card-header">
        <div>
          <h3>{action.title}</h3>
          <p>{action.description}</p>
        </div>
        <Badge tone={action.kind === 'deeplink' ? 'accent' : 'neutral'}>{action.kind === 'deeplink' ? 'deep link' : 'extension'}</Badge>
      </header>

      {action.templates && (
        <TemplatePanel
          templates={action.templates}
          onApply={patch => {
            setValues(prev => ({ ...prev, ...patch }));
            setOutcome(null);
          }}
          onError={fail}
        />
      )}

      {action.fields.length > 0 && (
        <div className="fields">
          {action.fields.map(field => (
            <Field key={field.name} field={field} value={values[field.name] ?? ''} values={values} onChange={value => setField(field.name, value)} onError={fail} />
          ))}
        </div>
      )}

      {action.kind === 'invoke' && action.preview && <CodeBlock title="Request" code={safePreview(() => action.preview!(values))} />}

      {prepared && (prepared.ok ? <CodeBlock title="Payload" code={stringify(prepared.payload)} /> : <p className="inline-error">{prepared.error}</p>)}

      <div className="card-actions">
        {action.kind === 'invoke' ? (
          <Button variant="primary" size="lg" icon={<PlayIcon />} loading={busy} onClick={invoke}>
            Execute
          </Button>
        ) : (
          <>
            <Button variant="primary" size="lg" icon={<ExternalIcon />} disabled={!prepared?.ok} onClick={openDeepLink}>
              Open in Adena
            </Button>
            {prepared?.ok && <CopyButton text={prepared.url} label="Copy link" />}
            {prepared?.ok && (
              <Button variant="ghost" size="sm" icon={<QrIcon />} aria-pressed={showQr} onClick={() => setShowQr(value => !value)}>
                QR
              </Button>
            )}
          </>
        )}
      </div>

      {showQr && prepared?.ok && <QrCode value={prepared.url} />}

      {outcome && <CodeBlock title={outcome.status === 'pending' ? 'Pending' : outcome.status === 'success' ? 'Response' : 'Error'} code={stringify(outcome.data)} tone={outcome.status} />}
    </article>
  );
};

const safePreview = (build: () => string): string => {
  try {
    return build();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
};
