import {Context} from 'react';

import CacheContext from './CacheContext';
import Key from './Key';

interface CacheReactContextHolder<K extends Key, V> {
  context: Context<CacheContext<K, V>>;
  missingValue: V;
}

export default CacheReactContextHolder;
