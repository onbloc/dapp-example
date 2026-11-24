// In-memory Web Storage and a minimal window for store modules under Node.
const data = new Map<string, string>();

const storage: Storage = {
  get length() {
    return data.size;
  },
  clear: () => data.clear(),
  getItem: key => data.get(key) ?? null,
  key: index => [...data.keys()][index] ?? null,
  removeItem: key => void data.delete(key),
  setItem: (key, value) => void data.set(key, String(value)),
};

Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
Object.defineProperty(globalThis, 'window', {
  value: Object.assign(new EventTarget(), { location: new URL('https://onbloc.github.io/dapp-example/mobile') }),
  configurable: true,
});
