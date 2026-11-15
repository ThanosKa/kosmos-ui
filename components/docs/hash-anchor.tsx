'use client';

import { useEffect } from 'react';

const settleTime = 4000;

/**
 * Previews and code blocks above an anchor change height after the first paint (iframes load, code blocks
 * measure themselves), which pushes the heading a link pointed at out of view. Until the page settles, or the
 * visitor scrolls on their own, the heading in the URL hash is scrolled back to the top after every layout change.
 */
export function HashAnchor() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id && document.getElementById(id);
    if (!target) return;

    const reveal = () => target.scrollIntoView({ block: 'start' });
    const observer = new ResizeObserver(reveal);
    observer.observe(document.body);
    const stop = () => {
      observer.disconnect();
      clearTimeout(timer);
      for (const event of userScrollEvents) window.removeEventListener(event, stop);
    };
    const timer = setTimeout(stop, settleTime);
    for (const event of userScrollEvents) window.addEventListener(event, stop, { passive: true, once: true });
    return stop;
  }, []);

  return null;
}

const userScrollEvents = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
