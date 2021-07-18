import React, {PureComponent, ReactNode}
  from 'react';

import AllCachesContext from './AllCachesContext';
import CacheMap from './CacheMap';
import Key from './Key';

const NULL_WRAP = new Object();
const UNDEFINED_WRAP = new Object();

function unwrap<V> (value: V): V {
  if (value === NULL_WRAP) return null;
  if (value === UNDEFINED_WRAP) return undefined;
  return value;
}

interface PropsType<K extends Key, V> {
  cacheId: string;
  getter: (key: K) => Promise<V>;
  children: ReactNode;
  mapSupplier: <T>(cacheId: string) => CacheMap<K, T>;
  missingValue?: V;
}

export default class RegisterCache<K extends Key, V>
  extends PureComponent<PropsType<K, V>> {

  public static defaultMapSupplier = <K, V>(): Map<K, V> => new Map<K, V>();

  static defaultProps = {
    mapSupplier: RegisterCache.defaultMapSupplier,
  };

  static override contextType = AllCachesContext;
  override context: React.ContextType<typeof AllCachesContext>;

  private readonly loading = new Set<K>();
  private readonly errors: CacheMap<K, unknown>;
  private readonly values: CacheMap<K, V>;
  private renderQueued = true;

  constructor (props: PropsType<K, V>) {
    super(props);

    this.values = props.mapSupplier<V>(props.cacheId);
    this.errors = props.mapSupplier<unknown>(props.cacheId);
  }

  /** update context and force component rerender to consume new context */
  private readonly queueRender = () => {
    if (!this.renderQueued) {
      this.contextValue = {
        ...this.contextValue,
        updateCounter: this.contextValue.updateCounter + 1,
      };
      this.forceUpdate();
      this.renderQueued = true;
    }
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
          const resultValue = await this.props.getter(key);
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

  private contextValue = {
    delete: this.handleDelete,
    get: this.handleGet,
    updateCounter: 0,
  };

  override render (): JSX.Element {
    this.renderQueued = false;

    const {cacheId, missingValue, children} = this.props;
    const cacheContextHolder = this.context.getOrRegister(cacheId, missingValue);

    if (!cacheContextHolder) {
      return children as unknown as JSX.Element;
    }

    return React.createElement(cacheContextHolder.context.Provider, {
      value: this.contextValue
    }, children);
  }
}
