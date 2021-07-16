import Key from './Key';

interface CacheContext<K extends Key, V> {
  get: (key: K) => V;
}

export default CacheContext;
