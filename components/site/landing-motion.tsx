'use client';

import * as React from 'react';

type Target = { element: HTMLElement; delay: number };

/** The step between a section's title and its parts, and between sibling parts, in milliseconds. */
const step = 100;

/** The parts of each section that rise on their own: the title, then the content, or the rows or plans inside it. */
function collectTargets(): Target[] {
  const targets: Target[] = [];
  document.querySelectorAll<HTMLElement>('[data-landing-section]').forEach((section) => {
    const id = section.dataset.landingSection;
    if (id === 'hero' || id === 'footer') return;
    const title = section.querySelector<HTMLElement>('[data-landing-title]');
    const content = section.querySelector<HTMLElement>('[data-landing-content]');
    if (title) targets.push({ element: title, delay: 0 });
    const wait = title ? step : 0;
    const parts = id === 'features' ? '[data-slot="feature-rows-item"]' : id === 'pricing' ? '[data-slot="pricing-plan"]' : null;
    const items = parts ? [...section.querySelectorAll<HTMLElement>(parts)] : [];
    if (items.length) items.forEach((element, index) => targets.push({ element, delay: id === 'pricing' ? wait + index * step : 0 }));
    else if (content) targets.push({ element: content, delay: wait });
  });
  return targets;
}

/**
 * Arms the scroll reveals: every part that starts below the fold is hidden and rises 16px, once, the first time it is
 * on screen. A part already on screen stays put, and nothing replays on the way back up. Nothing is hidden before this
 * runs, so the page is complete without JavaScript.
 */
function LandingMotion() {
  React.useEffect(() => {
    const armed: HTMLElement[] = [];
    const timers: number[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          observer.unobserve(element);
          element.dataset.reveal = 'in';
          const wait = Number.parseFloat(element.style.getPropertyValue('--m-delay')) || 0;
          timers.push(window.setTimeout(() => delete element.dataset.reveal, wait + 700));
        });
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    collectTargets().forEach(({ element, delay }) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) return;
      element.style.setProperty('--m-delay', `${delay}ms`);
      element.dataset.reveal = 'hidden';
      armed.push(element);
      observer.observe(element);
    });
    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
      armed.forEach((element) => {
        delete element.dataset.reveal;
        element.style.removeProperty('--m-delay');
      });
    };
  }, []);
  return null;
}

export { LandingMotion };
