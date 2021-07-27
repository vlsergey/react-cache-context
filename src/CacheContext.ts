import Key from './Key';

interface CacheContext<K extends Key, V> {
  get: (key: K) => V;
  delete: (key: K) => unknown;
  clear: () => unknown;
}

export default CacheContext;
