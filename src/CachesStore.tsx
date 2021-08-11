import React, {PureComponent, ReactNode} from 'react';

import AllCachesContext from './AllCachesContext';
import CacheContext from './CacheContext';
import CacheReactContextHolder from './CacheReactContextHolder';
import CacheSpec from './CacheSpec';
import Key from './Key';
import RegisterCache from './RegisterCache';

interface PropsType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  caches?: Record<string, CacheSpec<any, any>>;
  children: ReactNode;
}

function defaultCacheContext<K extends Key, V> (cacheId: string): CacheContext<K, V> {
  const errorThrower = (): unknown => {
    throw new Error(`Trying to access cache ${cacheId} outside of RegisterCache element (no cache context provided)`);
  };
  return {
    clear: errorThrower as CacheContext<K, V>['clear'],
    delete: errorThrower as CacheContext<K, V>['delete'],
    get: errorThrower as CacheContext<K, V>['get'],
    getPromise: errorThrower as CacheContext<K, V>['getPromise'],
  };
}

// we are using class component instead of functional
// because we need class fields and don't want to incorrectly use useState() hook

export default class CachesStore extends PureComponent<PropsType> {

  private readonly caches = {} as Record<string, CacheReactContextHolder<Key, unknown>>;

  private readonly handleGet = <K extends Key, V>(cacheId: string): CacheReactContextHolder<K, V> => {
    const result = this.caches[cacheId] as undefined | CacheReactContextHolder<K, V>;
    if (!result) {
      throw new Error(`Cache with id ${cacheId} is not defined yet`);
    }
    return result;
  };

  private readonly handleGetOrRegister = <K extends Key, V>(
    cacheId: string,
    missingValue?: V
  ): CacheReactContextHolder<K, V> => {
    const registered = this.caches[cacheId] as undefined | CacheReactContextHolder<K, V>;
    if (registered) return registered;

    const newCacheContext = React.createContext(defaultCacheContext<K, V>(cacheId));
    const newCache: CacheReactContextHolder<K, V> = {
      context: newCacheContext,
      missingValue,
    };
    this.caches[cacheId] = newCache as unknown as CacheReactContextHolder<Key, unknown>;
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
            getter: cacheSpec
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
