import Key from './Key';

interface CacheMap<K extends Key, V> {
  delete: (key: K) => unknown;
  has: (key: K) => boolean;
  get: (key: K) => V;
  set: (key: K, value: V) => unknown;
}

export default CacheMap;
