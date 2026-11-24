const PREFIX = 'adena-dapp-example:';

export const readStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
};

export const writeStorage = (key: string, value: unknown): void => {
  try {
    if (value === undefined) {
      localStorage.removeItem(PREFIX + key);
    } else {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    }
  } catch {
    // Quota exceeded or storage disabled (private mode): keep running in memory only.
  }
};

export const storageKey = (key: string): string => PREFIX + key;

// Minimal external store backed by localStorage and synced across tabs.
export const createPersistedStore = <T>(key: string, fallback: T) => {
  let state = readStorage(key, fallback);
  const listeners = new Set<() => void>();
  const emit = (): void => listeners.forEach(listener => listener());

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', event => {
      if (event.key === storageKey(key)) {
        state = readStorage(key, fallback);
        emit();
      }
    });
  }

  return {
    get: (): T => state,
    set: (next: T | ((prev: T) => T)): void => {
      state = typeof next === 'function' ? (next as (prev: T) => T)(state) : next;
      writeStorage(key, state);
      emit();
    },
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export type PersistedStore<T> = ReturnType<typeof createPersistedStore<T>>;
