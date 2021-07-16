import React, {ReactNode, useCallback, useContext, useMemo, useState}
  from 'react';

import AllCachesContext from './AllCachesContext';
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
  missingValue?: V;
}

function withoutKey<K extends Key, V> (src: Record<K, V>, key: K): Record<K, V> {
  if (!Object.prototype.hasOwnProperty.call(src, key)) {
    return src;
  }

  const result = {...src};
  delete result[ key ];
  return result;
}

function RegisterCache<K extends Key, V> ({
  cacheId,
  children,
  getter,
  missingValue,
}: PropsType<K, V>): JSX.Element {
  const allCachesContext = useContext(AllCachesContext);
  const cacheContextHolder = allCachesContext.getOrRegister(cacheId, missingValue);

  // will be used without setState()
  // also it will allow to call get() without wrapping in useEffect()
  const [ loading ] = useState({} as Record<K, boolean>);
  const [ errors, setErrors ] = useState({} as Record<K, unknown>);
  const [ values, setValues ] = useState({} as Record<K, V>);

  const handleGet = useCallback((key: K) => {
    const error = errors[ key ];
    if (error !== undefined) {
      throw error;
    }

    const value = values[ key ];
    if (value !== null && value !== undefined) {
      return unwrap(value);
    }

    if (!loading[ key ]) {
      loading[ key ] = true;
      void (async () => {
        try {
          const resultValue = await getter(key);
          setValues(v => ({...v, [ key ]: resultValue}));
          setErrors(e => withoutKey(e, key));
        } catch (err: unknown) {
          setErrors(e => ({...e, [ key ]: err}));
          setValues(v => withoutKey(v, key));
        } finally {
          delete loading[ key ];
        }
      })();
    }

    return missingValue;
  }, [ getter, missingValue, errors, setErrors, loading, values, setValues ]);

  const contextValue = useMemo(() => ({
    get: handleGet
  }), [ handleGet ]);

  if (!cacheContextHolder) {
    return children as unknown as JSX.Element;
  }

  return React.createElement(cacheContextHolder.context.Provider, {
    value: contextValue
  }, children);
}

export default React.memo(RegisterCache);
