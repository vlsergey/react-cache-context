import CacheReactContextHolder from './CacheReactContextHolder';
import Key from './Key';

interface AllCachesContextType {
  get: <K extends Key, V>(cacheId: string) => CacheReactContextHolder<K, V>;
  getOrRegister: <K extends Key, V>(cacheId: string, missingValue?: V) => CacheReactContextHolder<K, V>;
}

export default AllCachesContextType;
