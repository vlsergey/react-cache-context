import Key from './Key';

interface CacheContext<K extends Key, V> {
  get: (key: K) => V;
  delete: (key: K) => unknown;
}

export default CacheContext;
