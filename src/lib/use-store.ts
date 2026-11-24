import { useSyncExternalStore } from 'react';

import type { PersistedStore } from './storage';

export const useStore = <T>(store: PersistedStore<T>): T => useSyncExternalStore(store.subscribe, store.get, store.get);
