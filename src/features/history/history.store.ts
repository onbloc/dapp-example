import type { FormValues, Platform } from '@/core/action';
import { createId } from '@/lib/id';
import { createPersistedStore } from '@/lib/storage';

export type HistoryStatus = 'pending' | 'success' | 'failure';

export interface HistoryEntry {
  id: string;
  platform: Platform;
  actionId: string;
  title: string;
  values: FormValues;
  status: HistoryStatus;
  createdAt: number;
  completedAt?: number;
  // Deep link request id, used to match the wallet callback.
  requestId?: string;
  request?: unknown;
  result?: unknown;
}

const MAX_ENTRIES = 100;

export const historyStore = createPersistedStore<HistoryEntry[]>('history:v1', []);

export const addHistory = (entry: Omit<HistoryEntry, 'id' | 'createdAt'>): HistoryEntry => {
  const created: HistoryEntry = { ...entry, id: createId('h'), createdAt: Date.now() };
  historyStore.set(entries => [created, ...entries].slice(0, MAX_ENTRIES));
  return created;
};

export const updateHistory = (id: string, patch: Partial<HistoryEntry>): void =>
  historyStore.set(entries => entries.map(entry => (entry.id === id ? { ...entry, ...patch } : entry)));

export const removeHistory = (id: string): void => historyStore.set(entries => entries.filter(entry => entry.id !== id));

export const clearHistory = (platform: Platform): void =>
  historyStore.set(entries => entries.filter(entry => entry.platform !== platform));

export const findHistoryByRequestId = (requestId: string): HistoryEntry | undefined =>
  historyStore.get().find(entry => entry.requestId === requestId);
