import { useEffect } from 'react';

import type { FormValues } from '@/core/action';

type Listener = (values: FormValues) => void;

const listeners = new Map<string, Set<Listener>>();

// Restores a history entry's inputs into the matching action card.
export const prefillAction = (actionId: string, values: FormValues): void => {
  listeners.get(actionId)?.forEach(listener => listener(values));
  document.getElementById(`action-${actionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const usePrefill = (actionId: string, listener: Listener): void => {
  useEffect(() => {
    const set = listeners.get(actionId) ?? new Set();
    set.add(listener);
    listeners.set(actionId, set);
    return () => {
      set.delete(listener);
    };
  }, [actionId, listener]);
};
