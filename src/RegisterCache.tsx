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
  if (value === NULL_WRAP) return null as unknown as V;
  if (value === UNDEFINED_WRAP) return undefined as unknown as V;
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
  override context: undefined | React.ContextType<typeof AllCachesContext> = undefined;

  override state = {
    updateCounter: 0,
  };

  private readonly loading = new Map<K, Promise<V>>();
  private readonly errors: CacheMap<K, unknown>;
  private readonly values: CacheMap<K, V>;

  constructor (props: PropsType<K, V>) {
    super(props);

    const mapSupplier: <T>(cacheId: string) => CacheMap<K, T> =
      this.props.mapSupplier || RegisterCache.defaultMapSupplier;
    this.values = mapSupplier<V>(props.cacheId);
    this.errors = mapSupplier<unknown>(props.cacheId);
  }

  /** update state and thus force component rerender to provide new context to children */
  private readonly queueRender = () => {
    this.setState(({updateCounter}) => ({updateCounter: updateCounter + 1}));
  };

  private readonly handleClear = (): void => {
    this.values.clear();
    this.errors.clear();
    this.queueRender();
  };

  private readonly handleDelete = (key: K): void => {
    if (key === null) return;

    this.values.delete(key);
    this.errors.delete(key);
    this.queueRender();
  };

  private readonly handleGet = (key: K | null | undefined): V | undefined => {
    if (key === null || key === undefined) return this.props.missingValue;

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

  private readonly handleGetPromise = (key: K | null | undefined): Promise<undefined | V> => {
    if (key === null || key === undefined) return Promise.resolve(this.props.missingValue);

    const value = this.values.get(key);
    if (value !== null && value !== undefined) {
      return Promise.resolve(unwrap<V>(value));
    }
    const currentlyLoadingPromise = this.loading.get(key);
    if (currentlyLoadingPromise) {
      return currentlyLoadingPromise;
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

    const allCachesContext = this.context;
    if (!allCachesContext) throw new Error('<RegisterCache> must be placed inside of <AllCachesContext> element');
    const cacheContextHolder = allCachesContext.getOrRegister<K, V>(cacheId, missingValue);

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
