# @vlsergey/react-cache-context
[![NPM version][npm-image]][npm-url]
[![CI Status][ci-image]][ci-url]
[![Downloads][downloads-image]][downloads-url]

React Context for caching values by key.

Main features:
* [x] Key-value cache with simple `useCacheValue()` hook
* [x] Supports multiple caches, each uses it's own React context. Updating single cache will _not_ result in whole-application rerender.
* [x] Can be integrated with LRU / TTL map implementations with `mapSupplier` property.

## Installation:
```
npm install --save @vlsergey/react-cache-context
```
or
```
npm install --save-dev @vlsergey/react-cache-context
```

## Usage

```jsx
// in application root
import {CachesStore, RegisterCache} from "@vlsergey/react-cache-context";

/* ... */
// include CachesStore inside any authorization providers/wrappers if any present,
// but outside of routing providers
return <CachesStore>
  <RegisterCache
    cacheId="groupsCache"
    getter={ async ( groupId ) => (await new Api().groups.findById( groupId )).data }>
    <RegisterCache
      cacheId="studentsCache"
      getter={ async ( studentId ) => (await new Api().students.findById( studentId )).data }>
        { /* ... */ }
    </RegisterCache>
  </RegisterCache>
</CachesStore>
```

```jsx
// in some (function) component
import {useCacheValue} from "@vlsergey/react-cache-context";

const StudentName = ( studentId ) => {
  const student = useCacheValue( 'studentsCache', studentId );
  return (student || {}).name || studentId;
}
```

## API

### `useCache( cacheId: string ) : CacheContext<K, V>`
Provide access to cache context with specified `cacheId`. Hook should be called inside component inside corresponding `<RegisterCache>` element (otherwise all calls to it's methods will result in error).

`CacheContext<K, V>` provides man methods to get or invalidate information from single cache:
```TypeScript
interface CacheContext<K extends Key, V> {
  get: (key: K) => V;
  delete: (key: K) => unknown;
}
```

### `useCacheValue<K, V>( cacheId: string, key: K ) : V`
Returns currently stored value from cache or throws error if last call of `getter` with provided key resulted an error. If no value present (and loading is not in progress yet) will generate async call to `getter` to obtain value.

If no value and no error present in cache immediately returns `missingValue` property of `<RegisterCache>`, or `undefined` if such property were not set.

Current implementation will retry to obtain value if last `getter` returns an error.

## Use as LRU (last recently used) or TTL cache
With `mapSupplier` property of `RegisterCache` component one can use LRU or TTL map implementations as internal cache store. Note, that internally two maps are used for each cache: map of values (`CacheMap<K, V>`) and maps of errors (`CacheMap<K, unknown>`).

Provided map must conform to following interface (partial interface of JavaScript `Map`):
```TypeScript
interface CacheMap<K extends Key, V> {
  delete: (key: K) => unknown;
  has: (key: K) => boolean;
  get: (key: K) => V;
  set: (key: K, value: V) => unknown;
}
```

[npm-image]: https://img.shields.io/npm/v/@vlsergey/react-cache-context.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@vlsergey/react-cache-context
[ci-image]: https://github.com/vlsergey/react-cache-context/actions/workflows/node.js.yml/badge.svg?branch=master
[ci-url]: https://github.com/vlsergey/react-cache-context/actions/workflows/node.js.yml
[downloads-image]: http://img.shields.io/npm/dm/@vlsergey/react-cache-context.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/@vlsergey/react-cache-context
