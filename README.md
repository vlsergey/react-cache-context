# @vlsergey/react-cache-context
[![NPM version][npm-image]][npm-url]
[![CI Status][ci-image]][ci-url]
[![Downloads][downloads-image]][downloads-url]

React Context for caching values by key, optionally with batched values supplier.

Main features:
* [x] Key-value cache with simple `useFromCache()` and `useFromCacheOrQueue()` hook interfaces

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
  return (student || {}).name || null;
}
```

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
