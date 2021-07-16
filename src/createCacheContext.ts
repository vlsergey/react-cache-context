import React from "react";

export default function createCacheContext<T>() {
  return React.createContext({} as Record<string, T>);
}
