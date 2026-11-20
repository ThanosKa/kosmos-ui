'use client';

import * as React from 'react';

/**
 * False on the first render, true from the next frame on. An entrance such as `starting:opacity-0`, applied only when
 * it is true, plays for the elements that arrive later and not for the ones a page loads with: a browser starts from a
 * starting style only on an element's first style, so adding the class to an element already shown does nothing.
 */
function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return mounted;
}

export { useMounted };
