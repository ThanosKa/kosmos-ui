'use client';

import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { EasingDemo } from '@/components/docs/easing-demo';
import type { TokenOverview } from '@/lib/foundations';
import { cn } from '@/registry/kosmos/lib/cn';

/** The site's preset and theme land on `<html>` and in a `<style>` in `<head>`, so a change there can change any token. */
function subscribeToRootStyle(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
  observer.observe(document.head, { childList: true, subtree: true, characterData: true });
  return () => observer.disconnect();
}

/** The values the variables hold right now, under the preset and theme the document has. */
function useLiveValues(names: readonly string[]) {
  const snapshot = React.useSyncExternalStore(
    subscribeToRootStyle,
    () => {
      const style = getComputedStyle(document.documentElement);
      return names.map((name) => style.getPropertyValue(`--${name}`).trim()).join('\n');
    },
    () => '',
  );
  return snapshot ? snapshot.split('\n') : names.map(() => '');
}

const hexByte = (value: number) => value.toString(16).padStart(2, '0').toUpperCase();

/**
 * Each color as hex, plus its opacity when it is see-through. A custom property reads back as written (`color-mix(…)`,
 * `lab(…)` with float noise), so a probe resolves it to a used color and a 1px canvas turns that into sRGB bytes.
 */
function readHexColors(names: readonly string[]) {
  const probe = document.body.appendChild(document.createElement('span'));
  const context = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
  const hex = names.map((name) => {
    probe.style.color = `var(--${name})`;
    if (!context) return '';
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = getComputedStyle(probe).color;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    return `#${hexByte(r)}${hexByte(g)}${hexByte(b)}${a < 255 ? ` · ${Math.round((a / 255) * 100)}%` : ''}`;
  });
  probe.remove();
  return hex.join('\n');
}

function useLiveColors(names: readonly string[]) {
  const snapshot = React.useSyncExternalStore(subscribeToRootStyle, () => readHexColors(names), () => '');
  return snapshot ? snapshot.split('\n') : names.map(() => '');
}

const rootFontSize = 16;

function lengthPx(value: string) {
  const match = /^([\d.]+)(rem|px)$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * (match[2] === 'rem' ? rootFontSize : 1);
}

/** A radius step in px under the preset's `--radius`: `var(--radius)` or `calc(var(--radius) ± Npx)`. */
function radiusPx(value: string, base: number | null) {
  if (base === null) return '';
  const offset = /^calc\(var\(--radius\)\s*([+-])\s*([\d.]+)px\)$/.exec(value);
  const px = offset ? base + (offset[1] === '+' ? 1 : -1) * Number(offset[2]) : base;
  return `${Math.round(px * 100) / 100}px`;
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const id = React.useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h2 id={id} className="text-title">
          {title}
        </h2>
        <p className="max-w-[40em] text-small text-pretty text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Colors({ groups, colors }: Pick<TokenOverview, 'colors'> & { groups: TokenOverview['colorGroups'] }) {
  const values = useLiveColors(colors.map((color) => color.name));
  const valueOf = new Map(colors.map((color, index) => [color.name, values[index]]));
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          <h3 className="text-caption tracking-[0.05em] text-muted-foreground uppercase">{group.label}</h3>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {colors
              .filter((color) => color.group === group.id)
              .map((color) => (
                <li key={color.name} className="flex items-center gap-3 rounded-2xl border border-transparent bg-card p-2 shadow-card">
                  <span
                    style={{ '--swatch': `var(--${color.name})` } as CSSProperties}
                    className="size-10 shrink-0 rounded-lg border border-transparent bg-(--swatch) shadow-inset"
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <code className="truncate text-body font-medium">{color.className}</code>
                    <span title={valueOf.get(color.name)} className="truncate font-mono text-caption text-muted-foreground">
                      {valueOf.get(color.name)}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Shadows({ shadows }: Pick<TokenOverview, 'shadows'>) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {shadows.map((shadow) => (
        <li key={shadow.name} className="flex flex-col gap-3">
          <span
            style={{ '--tile-shadow': `var(--${shadow.name})` } as CSSProperties}
            className={cn('h-20 rounded-xl border border-transparent shadow-(--tile-shadow)', shadow.fill)}
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <code className="text-body font-medium">{shadow.name}</code>
            <p className="text-small text-pretty text-muted-foreground">{shadow.surface}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Radii({ radii }: Pick<TokenOverview, 'radii'>) {
  const [base] = useLiveValues(['radius']);
  const basePx = lengthPx(base);
  return (
    <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-6">
      {radii.map((radius) => (
        <li key={radius.name} className="flex flex-col gap-3">
          <span
            style={{ '--tile-radius': radius.value } as CSSProperties}
            className="h-20 rounded-(--tile-radius) border border-transparent bg-card shadow-card"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <code className="text-body font-medium">{radius.className}</code>
              <span className="font-mono text-caption text-muted-foreground tabular-nums">{radiusPx(radius.value, basePx)}</span>
            </div>
            <p className="text-small text-pretty text-muted-foreground">{radius.use}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function TypeScale({ typeRoles }: Pick<TokenOverview, 'typeRoles'>) {
  return (
    <ul className="flex flex-col divide-y divide-border rounded-2xl border border-transparent bg-card px-4 shadow-card">
      {typeRoles.map((role) => (
        <li key={role.role} className="grid grid-cols-1 gap-2 py-4 md:grid-cols-[12rem_minmax(0,1fr)] md:items-baseline md:gap-6">
          <div className="flex flex-col gap-0.5">
            <code className="text-body font-medium">{role.className}</code>
            <span className="font-mono text-caption text-muted-foreground tabular-nums">{role.spec}</span>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <p className={cn('min-w-0 text-pretty tabular-nums', role.className)}>Revenue grew 12.4% to $48,210 in Q3</p>
            <p className="text-small text-pretty text-muted-foreground">{role.use}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Durations({ durations }: Pick<TokenOverview, 'durations'>) {
  const longest = Math.max(...durations.map((item) => Number.parseFloat(item.value)));
  return (
    <ul className="flex flex-col gap-3">
      {durations.map((item) => (
        <li key={item.className} className="grid grid-cols-[8rem_3.5rem_minmax(0,1fr)] items-center gap-4">
          <code className="text-body font-medium">{item.className}</code>
          <span className="text-small text-muted-foreground tabular-nums">{item.value}</span>
          <span
            title={item.use}
            style={{ '--bar-width': `${(Number.parseFloat(item.value) / longest) * 100}%` } as CSSProperties}
            className="h-2 w-(--bar-width) rounded-full bg-primary"
          />
        </li>
      ))}
    </ul>
  );
}

/** The Tokens screen of the Presets preview: every token under the preset and theme the site has now. */
export function PresetTokens({ tokens }: { tokens: TokenOverview }) {
  return (
    <div className="flex flex-col gap-10 p-4 sm:p-6">
      <Section title="Colors" description="Semantic, shadcn-compatible names, with the values of the preset you picked, in the theme the site is in.">
        <Colors groups={tokens.colorGroups} colors={tokens.colors} />
      </Section>
      <Section title="Shadows" description="Surfaces draw their edge and depth with one layered shadow, not a border. In dark each one adds a 1px rim of light.">
        <Shadows shadows={tokens.shadows} />
      </Section>
      <Section title="Radius" description="Every step follows the preset's radius, so nested corners stay concentric.">
        <Radii radii={tokens.radii} />
      </Section>
      <Section title="Type" description="Dense UI text, 12 to 14px in components. Hierarchy comes from weight and color, not more sizes.">
        <TypeScale typeRoles={tokens.typeRoles} />
      </Section>
      <Section title="Motion" description="Named durations and two power curves, shared by Tailwind and Motion.">
        <Durations durations={tokens.durations} />
        <EasingDemo items={tokens.easings} />
      </Section>
    </div>
  );
}
