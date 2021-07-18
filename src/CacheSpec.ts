import CacheMap from './CacheMap';
import Key from './Key';

type CacheSpecAsFunction<K extends Key, V> = (key: K) => Promise<V>;

interface CacheSpecAsObject<K extends Key, V> {
  getter: (key: K) => Promise<V>;
  mapSupplier?: <T>(cacheId: string) => CacheMap<K, T>;
  missingValue?: V;
}

type CacheSpec<K extends Key, V> = CacheSpecAsFunction<K, V> | CacheSpecAsObject<K, V>;

export default CacheSpec;
