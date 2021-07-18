import React, {PureComponent, ReactNode} from 'react';

import AllCachesContext from './AllCachesContext';
import CacheContext from './CacheContext';
import CacheReactContextHolder from './CacheReactContextHolder';
import Key from './Key';

interface PropsType {
  children: ReactNode;
}

function defaultCacheContext<K extends Key, V> (cacheId: string): CacheContext<K, V> {
  const errorThrower = (): unknown => {
    throw new Error(`Trying to access cache ${cacheId} outside of RegisterCache element (no cache context provided)`);
  };
  return {
    delete: errorThrower as ((key: K) => unknown),
    get: errorThrower as ((key: K) => V),
  };
}

// we are using class component instead of functional
// because we need class fields and don't want to incorrectly use useState() hook

export default class CachesStore extends PureComponent<PropsType> {

  private readonly caches = {} as Record<string, CacheReactContextHolder<Key, unknown>>;

  private readonly handleGet = <K extends Key, V>(cacheId: string): CacheReactContextHolder<K, V> =>
    this.caches[cacheId] as CacheReactContextHolder<K, V>;

  private readonly handleGetOrRegister = <K extends Key, V>(
    cacheId: string,
    missingValue: V
  ): CacheReactContextHolder<K, V> => {
    if (this.caches[cacheId]) {
      return this.caches[cacheId] as CacheReactContextHolder<K, V>;
    }

    const newCacheContext = React.createContext(defaultCacheContext<K, V>(cacheId));
    const newCache: CacheReactContextHolder<K, V> = {
      context: newCacheContext,
      missingValue,
    };
    this.caches[cacheId] = newCache;
    return newCache;
  };

  private readonly contextValue = {
    get: this.handleGet,
    getOrRegister: this.handleGetOrRegister,
  };

  override render (): JSX.Element {
    return <AllCachesContext.Provider value={this.contextValue}>
      {this.props.children}
    </AllCachesContext.Provider>;
  }
}
