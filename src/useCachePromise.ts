import Key from './Key';
import useCache from './useCache';

export default function useCachePromise<K extends Key, V> (
    cacheId: string, key: K
): Promise<V> {
  const cacheContext = useCache<K, V>(cacheId);
  return cacheContext.getPromise(key);
}
