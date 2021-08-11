import Key from './Key';

interface CacheContext<K extends Key, V> {
  clear: () => unknown;
  delete: (key: K) => unknown;
  get: (key: K) => V | undefined;
  getPromise: (key: K) => Promise<V>;
}

export default CacheContext;
