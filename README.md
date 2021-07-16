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

[npm-image]: https://img.shields.io/npm/v/@vlsergey/react-bootstrap-csv-export.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@vlsergey/react-bootstrap-csv-export
[ci-image]: https://github.com/vlsergey/react-bootstrap-csv-export/actions/workflows/node.js.yml/badge.svg?branch=master
[ci-url]: https://github.com/vlsergey/react-bootstrap-csv-export/actions/workflows/node.js.yml
[downloads-image]: http://img.shields.io/npm/dm/@vlsergey/react-bootstrap-csv-export.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/@vlsergey/react-bootstrap-csv-export
