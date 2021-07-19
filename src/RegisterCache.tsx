import React, {PureComponent, ReactNode}
  from 'react';

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

  private readonly loading = new Set<K>();
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
      this.loading.add(key);
      void (async () => {
        try {
          const resultValue = wrap(await this.props.getter(key));
          this.values.set(key, resultValue);
          this.errors.delete(key);
        } catch (err: unknown) {
          this.errors.set(key, err);
          this.values.delete(key);
        } finally {
          this.loading.delete(key);
          this.queueRender();
        }
      })();
    }

    const error: unknown = this.errors.get(key);
    if (error !== undefined) {
      throw error;
    }

    return this.props.missingValue;
  };

  override render (): JSX.Element {
    const {cacheId, missingValue, children} = this.props;
    const cacheContextHolder = this.context.getOrRegister(cacheId, missingValue);

    if (!cacheContextHolder) {
      return children as unknown as JSX.Element;
    }

    return React.createElement(cacheContextHolder.context.Provider, {
      value: {
        delete: this.handleDelete,
        get: this.handleGet,
        updateCounter: this.state.updateCounter,
      } as CacheContext<K, V>
    }, children);
  }
}
