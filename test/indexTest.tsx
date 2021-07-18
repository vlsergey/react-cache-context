import {assert} from 'chai';
import React from 'react';
import {renderIntoDocument} from 'react-dom/test-utils';

import {CachesStore, RegisterCache, useCacheValue} from '../src';

const sleep = async (ms: number): Promise< unknown > => new Promise(resolve => setTimeout(resolve, ms));

describe('react-cache-context', () => {
  it('Able to render cache with instant getter return with CachesStore simple specs', async () => {
    const getter = (key: string) => Promise.resolve(`Hello, ${key}!`);

    const result = renderIntoDocument(<div>
      <CachesStore caches={{testCache: getter}}>
        <CacheValueJson cacheId="testCache" cacheKey="World" />
      </CachesStore>
    </div>) as unknown as HTMLDivElement;

    await sleep(0);
    assert.equal(result.textContent, JSON.stringify('Hello, World!'));
  });

  it('Able to render cache with instant getter return with CachesStore extended specs', async () => {
    const getter = (key: string) => Promise.resolve(`Hello, ${key}!`);

    const result = renderIntoDocument(<div>
      <CachesStore caches={{testCache: {getter}}}>
        <CacheValueJson cacheId="testCache" cacheKey="World" />
      </CachesStore>
    </div>) as unknown as HTMLDivElement;

    await sleep(0);
    assert.equal(result.textContent, JSON.stringify('Hello, World!'));
  });

  it('Able to render cache with instant getter return with RegisterCache', async () => {
    const getter = (key: string) => Promise.resolve(`Hello, ${key}!`);

    const result = renderIntoDocument(<div>
      <CachesStore>
        <RegisterCache cacheId="testCache" getter={getter}>
          <CacheValueJson cacheId="testCache" cacheKey="World" />
        </RegisterCache>
      </CachesStore>
    </div>) as unknown as HTMLDivElement;

    await sleep(0);
    assert.equal(result.textContent, JSON.stringify('Hello, World!'));
  });

  it('Able to render cache with delayed getter return', async () => {
    let myResolve: (value: string) => unknown;
    const getter = async () => new Promise((resolve: (value: string) => unknown) => {
      myResolve = resolve;
    });

    const result = renderIntoDocument(<div>
      <CachesStore>
        <RegisterCache cacheId="testCache" getter={getter}>
          <CacheValueJson cacheId="testCache" cacheKey="World" />
        </RegisterCache>
      </CachesStore>
    </div>) as unknown as HTMLDivElement;

    // not yet resolved
    await sleep(0);
    assert.equal(result.textContent, 'null');

    // resolved
    myResolve('Hello, World!');
    await sleep(0);
    assert.equal(result.textContent, '"Hello, World!"');
  });
});

interface CacheValueJsonPropsType {
  cacheId: string;
  cacheKey: string;
}

const CacheValueJson = ({cacheId, cacheKey}: CacheValueJsonPropsType): JSX.Element => {
  const value = useCacheValue(cacheId, cacheKey);
  return JSON.stringify(value || null) as unknown as JSX.Element || null;
};
