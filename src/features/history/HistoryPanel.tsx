import { useEffect, useState } from 'react';

import type { Platform } from '@/core/action';
import { stringify } from '@/lib/json';
import { useStore } from '@/lib/use-store';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { CodeBlock } from '@/ui/CodeBlock';
import { CloseIcon, RestoreIcon, TrashIcon } from '@/ui/icons';

import { clearHistory, historyStore, removeHistory, type HistoryEntry } from './history.store';
import { prefillAction } from './prefill.store';

const formatTime = (time: number): string =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(time);

const HistoryItem = ({ entry, onRestore }: { entry: HistoryEntry; onRestore: () => void }) => {
  const [open, setOpen] = useState(false);
  const restorable = entry.actionId !== 'unmatched-callback';

  return (
    <li className={`history-item ${open ? 'open' : ''}`}>
      <button type="button" className="history-summary" onClick={() => setOpen(value => !value)} aria-expanded={open}>
        <span className={`dot dot-${entry.status}`} aria-hidden />
        <span className="history-title">{entry.title}</span>
        <time>{formatTime(entry.createdAt)}</time>
      </button>
      {open && (
        <div className="history-body">
          <Badge tone={entry.status}>{entry.status}</Badge>
          {Object.keys(entry.values).length > 0 && <CodeBlock title="Inputs" code={stringify(entry.values)} />}
          {entry.request !== undefined && <CodeBlock title="Request" code={stringify(entry.request)} />}
          {entry.result !== undefined && <CodeBlock title="Result" code={stringify(entry.result)} tone={entry.status} />}
          <div className="history-actions">
            {restorable && (
              <Button size="sm" variant="secondary" icon={<RestoreIcon />} onClick={onRestore}>
                Load into form
              </Button>
            )}
            <Button size="sm" variant="ghost" icon={<TrashIcon />} onClick={() => removeHistory(entry.id)}>
              Delete
            </Button>
          </div>
        </div>
      )}
    </li>
  );
};

export const HistoryPanel = ({ platform, open, onClose }: { platform: Platform; open: boolean; onClose: () => void }) => {
  const entries = useStore(historyStore).filter(entry => entry.platform === platform);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, open]);

  return (
    <>
      <div className={`scrim ${open ? 'visible' : ''}`} onClick={onClose} aria-hidden />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-label="Execution history" aria-hidden={!open} inert={!open}>
        <header className="drawer-header">
          <div>
            <h2>History</h2>
            <p>{entries.length} saved in this browser · {platform}</p>
          </div>
          <Button variant="ghost" size="sm" icon={<CloseIcon />} onClick={onClose} aria-label="Close history" />
        </header>
        {entries.length === 0 ? (
          <p className="empty">Executed commands are saved here, with their inputs and results.</p>
        ) : (
          <>
            <ul className="history-list">
              {entries.map(entry => (
                <HistoryItem
                  key={entry.id}
                  entry={entry}
                  onRestore={() => {
                    onClose();
                    prefillAction(entry.actionId, entry.values);
                  }}
                />
              ))}
            </ul>
            <footer className="drawer-footer">
              <Button variant="danger" size="sm" icon={<TrashIcon />} onClick={() => confirm(`Clear all ${platform} history?`) && clearHistory(platform)}>
                Clear {platform} history
              </Button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
};
