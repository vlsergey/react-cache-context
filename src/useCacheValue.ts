import {useContext} from 'react';

import AllCachesContext from './AllCachesContext';
import CacheReactContextHolder from './CacheReactContextHolder';
import Key from './Key';

export default function useCacheValue<K extends Key, V> (cacheId: string, key: K): V {
  const allCachesContext = useContext(AllCachesContext);
  const cacheContextHolder: CacheReactContextHolder<K, V> = allCachesContext.get(cacheId);
  const cacheContext = useContext(cacheContextHolder.context);
  return cacheContext.get(key);
}
