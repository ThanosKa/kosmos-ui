import type { PresetStyle } from './palette.ts';

const monoLabel = {
  'font-family': 'var(--font-mono)',
  'font-weight': '500',
  'letter-spacing': '0.06em',
  'text-transform': 'uppercase',
};

const raised = {
  'background-color': 'var(--card)',
  'background-image': 'var(--console-raise)',
  'box-shadow': 'var(--shadow-control)',
};

const fields = [
  '[data-slot="input"]',
  '[data-slot="textarea"]',
  '[data-slot="input-group"]',
  '[data-slot="number-field-group"]',
  '[data-slot="combobox-input-group"]',
  '[data-slot="combobox-chips"]',
  '[data-slot="otp-field-input"]',
  '[data-slot="select-trigger"]:not([data-popup-open])',
  '[data-slot="date-picker-trigger"]:not([data-popup-open])',
].join(', ');

const currentNavItem = [
  '[data-slot="sidebar-menu-button"][data-active]',
  '[data-slot="sidebar-submenu-button"][data-active]:not([data-slot="sidebar-submenu-popup"] *)',
];

const pressable = ['primary', 'secondary', 'ghost', 'destructive'].map((variant) => `[data-variant="${variant}"]`).join(', ');

export const consoleStyle: PresetStyle = {
  summary:
    'A pro tool: a tight radius ladder with 8px cards, square 4px tags and a 3px checkbox. Every surface is drawn by a hairline ring, machined with a black outer ring and a faint inner rim in dark; buttons are raised by a soft top light and fields are recessed. Table heads, sidebar group labels, menu labels and badges are set in uppercase mono, motion is snappy with a lighter 0.98 press, the current nav item is a raised row, and the work area is a framed panel inside the rail.',
  theme: {
    'text-caption--letter-spacing': '0.005em',
    'text-small--letter-spacing': '0em',
    'text-body--letter-spacing': '-0.005em',
    'text-title--letter-spacing': '-0.01em',
    'text-heading--letter-spacing': '-0.015em',
    'text-display--font-weight': '600',
    'text-display--letter-spacing': '-0.03em',
    'text-hero--letter-spacing': '-0.045em',
    'ease-power3-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
    'ease-smooth-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
    'default-transition-duration': '90ms',
    'transition-duration-instant': '60ms',
    'transition-duration-fast': '90ms',
    'transition-duration-base': '120ms',
    'transition-duration-overlay': '150ms',
    'transition-duration-slow': '200ms',
  },
  light: {
    'shadow-control': '0 0 0 1px rgb(20 20 40 / 0.13), 0 1px 0 0 rgb(20 20 40 / 0.05)',
    'shadow-primary':
      '0 0 0 1px color-mix(in oklab, var(--primary) 80%, black), 0 1px 2px 0 color-mix(in oklab, color-mix(in oklab, var(--primary) 80%, black) 30%, transparent), inset 0 1px 0 0 rgb(255 255 255 / 0.18)',
    'shadow-primary-hover':
      '0 0 0 1px color-mix(in oklab, var(--primary) 72%, black), 0 2px 4px 0 color-mix(in oklab, color-mix(in oklab, var(--primary) 80%, black) 30%, transparent), inset 0 1px 0 0 rgb(255 255 255 / 0.22)',
    'shadow-card': '0 0 0 1px rgb(20 20 40 / 0.09), 0 1px 0 0 rgb(20 20 40 / 0.03)',
    'shadow-popover': '0 0 0 1px rgb(20 20 40 / 0.12), 0 6px 20px -4px rgb(20 20 40 / 0.14)',
    'shadow-modal': '0 0 0 1px rgb(20 20 40 / 0.12), 0 24px 48px -12px rgb(20 20 40 / 0.22), 0 4px 10px -2px rgb(20 20 40 / 0.06)',
    'shadow-inset': 'inset 0 0 0 1px rgb(20 20 40 / 0.07), inset 0 1px 1px 0 rgb(20 20 40 / 0.05)',
    'shadow-lift': '0 0 0 1px var(--ring), 0 0 0 3px color-mix(in oklab, var(--ring) 18%, transparent), 0 12px 24px -8px rgb(20 20 40 / 0.2)',
    'shadow-thumb': '0 0 0 1px rgb(20 20 40 / 0.14), 0 1px 2px 0 rgb(20 20 40 / 0.14)',
    'shadow-field': '0 0 0 1px var(--input), inset 0 1px 1px 0 rgb(20 20 40 / 0.04)',
  },
  dark: {
    'shadow-control':
      '0 0 0 1px rgb(0 0 0 / 0.55), 0 1px 2px 0 rgb(0 0 0 / 0.25), inset 0 1px 0 0 rgb(255 255 255 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.05)',
    'shadow-primary':
      '0 0 0 1px rgb(0 0 0 / 0.45), 0 2px 8px 0 color-mix(in oklab, var(--primary) 28%, transparent), inset 0 1px 0 0 rgb(255 255 255 / 0.2), inset 0 0 0 1px rgb(255 255 255 / 0.06)',
    'shadow-primary-hover': 'var(--shadow-primary)',
    'shadow-card': '0 0 0 1px rgb(0 0 0 / 0.55), inset 0 1px 0 0 rgb(255 255 255 / 0.035), inset 0 0 0 1px rgb(255 255 255 / 0.045)',
    'shadow-popover':
      '0 0 0 1px rgb(0 0 0 / 0.6), 0 10px 28px 0 rgb(0 0 0 / 0.5), inset 0 1px 0 0 rgb(255 255 255 / 0.05), inset 0 0 0 1px rgb(255 255 255 / 0.07)',
    'shadow-modal':
      '0 0 0 1px rgb(0 0 0 / 0.6), 0 8px 16px 0 rgb(0 0 0 / 0.3), 0 28px 56px 0 rgb(0 0 0 / 0.5), inset 0 1px 0 0 rgb(255 255 255 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.08)',
    'shadow-inset': '0 0 0 1px rgb(0 0 0 / 0.45), inset 0 1px 2px 0 rgb(0 0 0 / 0.35)',
    'shadow-lift': '0 0 0 1px var(--ring), 0 0 0 4px color-mix(in oklab, var(--ring) 22%, transparent), 0 16px 32px 0 rgb(0 0 0 / 0.5)',
    'shadow-thumb': '0 0 0 1px rgb(0 0 0 / 0.5), 0 1px 3px 0 rgb(0 0 0 / 0.5)',
    'shadow-field': '0 0 0 1px var(--input), inset 0 1px 2px 0 rgb(0 0 0 / 0.35)',
  },
  css: {
    ':root': {
      '--console-frame': '#fcfcfd',
      '--console-field': '#ffffff',
      '--console-head': '#f7f7f9',
      '--console-raise': 'linear-gradient(to bottom, transparent, rgb(20 20 40 / 0.025))',
    },
    '.dark': {
      '--console-frame': '#111114',
      '--console-field': '#0e0e11',
      '--console-head': '#16161a',
      '--console-raise': 'linear-gradient(to bottom, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0) 60%)',
    },
    body: {
      'font-variant-numeric': 'tabular-nums',
    },
    ':is([data-slot="stat-card"], [data-slot="chart-card"], [data-slot="stat-tile"], [data-slot="settings-card"], [data-slot="settings-panel"], [data-slot="danger-zone"], [data-slot="kanban-card"])': {
      'border-radius': 'calc(var(--radius) + 2px)',
    },
    ':is([data-slot="badge"], [data-slot="sidebar-menu-badge"], [data-slot="combobox-chip"])': {
      'border-radius': '4px',
    },
    '[data-slot="checkbox"]': {
      'border-radius': '3px',
    },
    '[data-slot="badge"]': {
      'font-family': 'var(--font-mono)',
      'font-weight': '500',
      'letter-spacing': '0',
    },
    ':is([data-slot="table-head"], [data-slot="table-head"] [data-slot="button"], [data-slot="sidebar-group-label"], [data-slot="dropdown-menu-label"], [data-slot="command-group-label"], [data-slot="select-group-label"], [data-slot="combobox-group-label"])':
      monoLabel,
    '[data-slot="table-header"]': {
      'background-color': 'var(--console-head)',
    },
    '[data-slot="button"]:is([data-variant="secondary"], [data-variant="destructive"]), [data-slot="segmented-control-thumb"], [data-slot="segmented-control-item"]::before':
      {
        'background-image': 'var(--console-raise)',
      },
    '[data-slot="button"][data-variant="primary"]': {
      'background-image': 'linear-gradient(to bottom, rgb(255 255 255 / 0.12), rgb(255 255 255 / 0))',
    },
    '.dark [data-slot="button"]:is([data-variant="primary"], [data-variant="secondary"])': {
      'text-shadow': '0 -1px 0 rgb(0 0 0 / 0.35)',
    },
    [fields]: {
      'background-color': 'var(--console-field)',
    },
    '@media (hover: hover)': {
      ':is([data-slot="select-trigger"], [data-slot="date-picker-trigger"]):hover:not([data-disabled])': {
        'background-color': 'var(--muted)',
      },
    },
    '@media (prefers-reduced-motion: no-preference)': {
      [`[data-slot="button"]:is(${pressable}):not(:disabled, [data-disabled]):active`]: {
        scale: '0.98',
      },
    },
    [`${currentNavItem.join(', ')}, [data-slot="navbar-nav"] :is([aria-current="page"], [data-current])`]: raised,
    '[data-slot="tabs-indicator"], [data-slot="tabs-trigger"]::after': {
      'background-color': 'var(--ring)',
    },
    '@media screen and (width >= 48rem)': {
      '[data-slot="sidebar-inset"]': {
        margin: '0.375rem 0.375rem 0.375rem 0',
        'border-radius': '0.625rem',
        'background-color': 'var(--console-frame)',
        'box-shadow': 'var(--shadow-card)',
        overflow: 'clip',
      },
      '[data-slot="sidebar-wrapper"]:has([data-slot="sidebar-inset"]) [data-slot="sidebar-inner"]': {
        'border-inline-end-color': 'transparent',
      },
    },
  },
};
