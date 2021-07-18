import {useContext} from 'react';

import AllCachesContext from './AllCachesContext';
import CacheContext from './CacheContext';
import CacheReactContextHolder from './CacheReactContextHolder';
import Key from './Key';

export default function useCache<K extends Key, V> (
    cacheId: string
): CacheContext<K, V> {
  const allCachesContext = useContext(AllCachesContext);
  const cacheContextHolder: CacheReactContextHolder<K, V> = allCachesContext.get(cacheId);
  return useContext(cacheContextHolder.context);
}
