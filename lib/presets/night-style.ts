import type { PresetStyle } from './palette.ts';

const cards = ':is([data-slot="stat-card"], [data-slot="chart-card"], [data-slot="panel-content"])';

export const nightStyle: PresetStyle = {
  summary:
    'An instrument panel: quicker motion, with every surface lit by a 1px rim and cards catching a faint top light in dark mode. Focus glows around the outline of tabs, navigation items and links. The current page in navigation is a raised key, the tabs indicator is a lit line, table heads are uppercase and tracked over tabular figures, and badges take 6px corners.',
  theme: {
    'text-caption--letter-spacing': '0.01em',
    'text-title--letter-spacing': '-0.015em',
    'text-display--font-weight': '600',
    'text-display--letter-spacing': '-0.035em',
    'text-hero--letter-spacing': '-0.045em',
    'transition-duration-instant': '80ms',
    'transition-duration-fast': '120ms',
    'transition-duration-base': '160ms',
    'transition-duration-overlay': '200ms',
    'default-transition-duration': '120ms',
  },
  light: {
    'shadow-card':
      '0 0 0 1px oklch(0.2 0.01 260 / 0.08), 0 1px 2px 0 oklch(0.2 0.01 260 / 0.05), 0 4px 12px -4px oklch(0.2 0.01 260 / 0.06)',
    'shadow-popover': '0 0 0 1px oklch(0.2 0.01 260 / 0.1), 0 12px 32px -4px oklch(0.2 0.01 260 / 0.18)',
    'shadow-modal': '0 0 0 1px oklch(0.2 0.01 260 / 0.1), 0 24px 64px -8px oklch(0.2 0.01 260 / 0.3)',
    'shadow-lift':
      '0 0 0 1px color-mix(in oklab, var(--ring) 40%, transparent), 0 0 0 4px color-mix(in oklab, var(--ring) 16%, transparent), 0 12px 32px -6px oklch(0.2 0.01 260 / 0.25)',
  },
  dark: {
    'shadow-card':
      '0 0 0 1px oklch(0 0 0 / 0.6), 0 6px 16px -6px oklch(0 0 0 / 0.6), inset 0 1px 0 0 oklch(1 0 0 / 0.07), inset 0 0 0 1px oklch(1 0 0 / 0.05)',
    'shadow-popover':
      '0 0 0 1px oklch(0 0 0 / 0.7), 0 16px 40px 0 oklch(0 0 0 / 0.6), inset 0 1px 0 0 oklch(1 0 0 / 0.08), inset 0 0 0 1px oklch(1 0 0 / 0.08)',
    'shadow-modal':
      '0 0 0 1px oklch(0 0 0 / 0.7), 0 24px 64px 0 oklch(0 0 0 / 0.7), 0 0 80px -20px color-mix(in oklab, var(--ring) 12%, transparent), inset 0 1px 0 0 oklch(1 0 0 / 0.08), inset 0 0 0 1px oklch(1 0 0 / 0.08)',
    'shadow-inset': '0 0 0 1px oklch(0 0 0 / 0.4), inset 0 2px 4px 0 oklch(0 0 0 / 0.3)',
    'shadow-thumb': '0 0 0 1px oklch(0 0 0 / 0.5), 0 2px 6px 0 oklch(0 0 0 / 0.6)',
    'shadow-lift':
      '0 0 0 1px color-mix(in oklab, var(--ring) 55%, transparent), 0 0 0 4px color-mix(in oklab, var(--ring) 18%, transparent), 0 0 24px 0 color-mix(in oklab, var(--ring) 25%, transparent), 0 12px 32px 0 oklch(0 0 0 / 0.6)',
  },
  css: {
    [`.dark ${cards}`]: {
      'background-image': 'linear-gradient(180deg, oklch(1 0 0 / 0.025), transparent 120px)',
    },
    ':is([data-slot="tabs-trigger"], [data-slot="sidebar-menu-button"], a:not([data-slot="button"])):focus-visible': {
      filter: 'drop-shadow(0 0 6px color-mix(in oklab, var(--ring) 55%, transparent))',
    },
    '[data-slot="sidebar-menu-button"][data-active]': {
      color: 'var(--sidebar-foreground)',
      'box-shadow': 'var(--shadow-control)',
    },
    ':root:not(.dark) [data-slot="sidebar-menu-button"][data-active]': {
      'background-color': 'var(--card)',
    },
    '[data-slot="tabs-indicator"], [data-slot="tabs-trigger"]::after': {
      'background-color': 'var(--accent-text)',
    },
    '[data-slot="tabs-indicator"]': {
      'box-shadow': '0 0 10px 0 color-mix(in oklab, var(--accent-text) 70%, transparent)',
    },
    ':root:not(.dark) [data-slot="tabs-indicator"]': {
      'box-shadow': 'none',
    },
    '[data-slot="table-head"]': {
      'text-transform': 'uppercase',
      'letter-spacing': '0.06em',
      'font-weight': '500',
    },
    '[data-slot="table-head"] button': {
      'text-transform': 'inherit',
      'letter-spacing': 'inherit',
      'font-weight': 'inherit',
    },
    '[data-slot="table"]': {
      'font-variant-numeric': 'tabular-nums',
    },
    '[data-slot="badge"]': {
      'border-radius': 'calc(var(--radius) - 2px)',
    },
  },
};
