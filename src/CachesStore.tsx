import React, {PureComponent, ReactNode} from 'react';

import AllCachesContext from './AllCachesContext';
import CacheContext from './CacheContext';
import CacheReactContextHolder from './CacheReactContextHolder';
import CacheSpec from './CacheSpec';
import Key from './Key';
import RegisterCache from './RegisterCache';

interface PropsType {
  caches?: Record<string, CacheSpec<Key, unknown>>;
  children: ReactNode;
}

function defaultCacheContext<K extends Key, V> (cacheId: string): CacheContext<K, V> {
  const errorThrower = (): unknown => {
    throw new Error(`Trying to access cache ${cacheId} outside of RegisterCache element (no cache context provided)`);
  };
  return {
    clear: errorThrower as (() => unknown),
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

  // we expect this method to be called once... well, unless children are not changed
  override render (): JSX.Element {
    const {caches, children} = this.props;

    let innerResult: ReactNode = children;
    if (caches) {
      Object.entries(caches).forEach(([cacheId, cacheSpec]) => {
        if (typeof cacheSpec === 'function') {
          innerResult = React.createElement(RegisterCache, {
            cacheId,
            getter: cacheSpec as ((key: unknown) => Promise<unknown>)
          }, innerResult);
        } else {
          innerResult = React.createElement(RegisterCache, {cacheId, ...cacheSpec}, innerResult);
        }
      });
    }

    return <AllCachesContext.Provider value={this.contextValue}>
      {innerResult}
    </AllCachesContext.Provider>;
  }
}
