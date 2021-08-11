import Key from './Key';

interface CacheMap<K extends Key, V> {
  clear: () => unknown;
  delete: (key: K) => unknown;
  has: (key: K) => boolean;
  get: (key: K) => V | undefined;
  set: (key: K, value: V) => unknown;
}

export default CacheMap;
