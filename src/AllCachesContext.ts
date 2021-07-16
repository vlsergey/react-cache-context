import React from 'react';

import AllCachesContextType from './AllCachesContextType';

export default React.createContext({
  get: () => { throw new Error('get() is called outside of <CachesStore> element'); },
  getOrRegister: () => { throw new Error('getOrRegister() is called outside of <CachesStore> element'); },
} as AllCachesContextType);
