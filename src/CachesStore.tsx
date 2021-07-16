import React, {ReactNode, useCallback, useMemo, useState} from 'react';

import AllCachesContext from './AllCachesContext';
import AllCachesContextType from './AllCachesContextType';
import CacheContext from './CacheContext';
import CacheReactContextHolder from './CacheReactContextHolder';
import Key from './Key';

interface PropsType {
  children: ReactNode;
}

const CachesStore = ({children}: PropsType) => {
  /* Yes, it's not good, but we are using mutable variable in state.
  Thus getOrRegister() can be called directly without wrapping into useEffect() */
  const [ caches ] = useState({} as Record<string, CacheReactContextHolder<Key, unknown>>);

  const handleGet = useCallback(<K extends Key, V>(cacheId: string): CacheReactContextHolder<K, V> =>
    caches[ cacheId ] as CacheReactContextHolder<K, V>, [ caches ]);

  const handleGetOrRegister = useCallback(<K extends Key, V>(
    cacheId: string,
    missingValue: V
  ): CacheReactContextHolder<K, V> => {
    if (caches[ cacheId ]) {
      return caches[ cacheId ] as CacheReactContextHolder<K, V>;
    }

    const newCacheContext = React.createContext({
      get: () => {
        throw new Error(`Trying to access cache ${cacheId} outside of RegisterCache element (no cache context provided)`);
      }
    } as CacheContext<K, V>);
    const newCache: CacheReactContextHolder<K, V> = {
      context: newCacheContext,
      missingValue,
    };
    caches[ cacheId ] = newCache;
    return newCache;
  }, [ caches ]);

  const contextValue = useMemo<AllCachesContextType>(() => ({
    get: handleGet,
    getOrRegister: handleGetOrRegister,
  }), [ handleGet, handleGetOrRegister ]);

  return <AllCachesContext.Provider value={contextValue}>
    {children}
  </AllCachesContext.Provider>;
};

export default React.memo(CachesStore);
