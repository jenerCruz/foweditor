import * as React from 'react';
import { useLayoutEffect as useLayoutEffect2 } from '../../react-use-layout-effect/dist/index.js';

// packages/react/id/src/id.tsx
var useReactId = React["useId".toString()] || (() => void 0);
var count = 0;
function useId(deterministicId) {
  const [id, setId] = React.useState(useReactId());
  useLayoutEffect2(() => {
    if (!deterministicId) setId((reactId) => reactId ?? String(count++));
  }, [deterministicId]);
  return deterministicId || (id ? `radix-${id}` : "");
}

export { useId };
