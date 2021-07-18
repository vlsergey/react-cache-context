import Key from './Key';
import useCache from './useCache';

export default function useCacheValue<K extends Key, V> (cacheId: string, key: K): V {
  const cacheContext = useCache<K, V>(cacheId);
  return cacheContext.get(key);
}
