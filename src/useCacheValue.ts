import Key from './Key';
import useCache from './useCache';

export default function useCacheValue<K extends Key, V> (cacheId: string, key: K | null | undefined): (V | undefined) {
  const cacheContext = useCache<K, V>(cacheId);
  return cacheContext.get(key);
}
