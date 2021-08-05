import React, {PureComponent, ReactNode} from 'react';

import AllCachesContext from './AllCachesContext';
import CacheContext from './CacheContext';
import CacheMap from './CacheMap';
import Key from './Key';

const NULL_WRAP = new Object();
const UNDEFINED_WRAP = new Object();

function wrap<V> (value: V): V {
  if (value === null) return NULL_WRAP as V;
  if (value === undefined) return UNDEFINED_WRAP as V;
  return value;
}

function unwrap<V> (value: V): V {
  if (value === NULL_WRAP) return null;
  if (value === UNDEFINED_WRAP) return undefined;
  return value;
}

interface PropsType<K extends Key, V> {
  cacheId: string;
  getter: (key: K) => Promise<V>;
  children?: ReactNode;
  mapSupplier?: <T>(cacheId: string) => CacheMap<K, T>;
  missingValue?: V;
}

interface StateType {
  updateCounter: number;
}

export default class RegisterCache<K extends Key, V>
  extends PureComponent<PropsType<K, V>, StateType> {

  public static defaultMapSupplier = <K, V>(): Map<K, V> => new Map<K, V>();

  static defaultProps = {
    mapSupplier: RegisterCache.defaultMapSupplier,
  };

  static override contextType = AllCachesContext;
  override context: React.ContextType<typeof AllCachesContext>;

  override state = {
    updateCounter: 0,
  };

  private readonly loading = new Map<K, Promise<V>>();
  private readonly errors: CacheMap<K, unknown>;
  private readonly values: CacheMap<K, V>;

  constructor (props: PropsType<K, V>) {
    super(props);

    this.values = props.mapSupplier<V>(props.cacheId);
    this.errors = props.mapSupplier<unknown>(props.cacheId);
  }

  /** update state and thus force component rerender to provide new context to children */
  private readonly queueRender = () => {
    this.setState(({updateCounter}) => ({updateCounter: updateCounter + 1}));
  };

  private readonly handleClear = () => {
    this.values.clear();
    this.errors.clear();
    this.queueRender();
  };

  private readonly handleDelete = (key: K) => {
    this.values.delete(key);
    this.errors.delete(key);
    this.queueRender();
  };

  private readonly handleGet = (key: K) => {
    const value = this.values.get(key);
    if (value !== null && value !== undefined) {
      return unwrap(value);
    }

    if (!this.loading.has(key)) {
      void this.queueLoad(key);
    }

    const error: unknown = this.errors.get(key);
    if (error !== undefined) {
      throw error;
    }

    return this.props.missingValue;
  };

  private readonly handleGetPromise = (key: K) => {
    const value = this.values.get(key);
    if (value !== null && value !== undefined) {
      return Promise.resolve(unwrap(value));
    }
    if (this.loading.has(key)) {
      return this.loading.get(key);
    }
    return this.queueLoad(key);
  };

  private readonly queueLoad = (key: K): Promise<V> => {
    const getPromise: Promise<V> = this.props.getter(key);
    this.loading.set(key, getPromise);

    const doFinally = () => {
      this.loading.delete(key);
      this.queueRender();
    };

    void getPromise.then((value: V) => {
      const wrappedValue = wrap(value);
      this.values.set(key, wrappedValue);
      this.errors.delete(key);
      doFinally();
    });

    getPromise.catch((err: unknown) => {
      this.errors.set(key, err);
      this.values.delete(key);
      doFinally();
    });

    return getPromise;
  };

  override render (): JSX.Element {
    const {cacheId, missingValue, children} = this.props;
    const cacheContextHolder = this.context.getOrRegister(cacheId, missingValue);

    if (!cacheContextHolder) {
      return children as unknown as JSX.Element;
    }

    return React.createElement(cacheContextHolder.context.Provider, {
      value: {
        clear: this.handleClear,
        delete: this.handleDelete,
        get: this.handleGet,
        getPromise: this.handleGetPromise,
        updateCounter: this.state.updateCounter,
      } as CacheContext<K, V>
    }, children);
  }
}
