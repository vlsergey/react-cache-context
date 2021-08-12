import Key from './Key';

type ReturnPromiseType<Input, V> = Input extends null ? Promise<undefined>
                                : Input extends undefined ? Promise<undefined>
                                : Promise<V>;

interface CacheContext<K extends Key, V> {
  clear: () => unknown;
  delete: (key: K) => unknown;
  get: (key: K | null | undefined) => V | undefined;
  getPromise: <ActualKey extends K | null | undefined>(key: ActualKey) => ReturnPromiseType<ActualKey, V>;
}

export default CacheContext;
