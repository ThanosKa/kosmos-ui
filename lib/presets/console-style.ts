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

const currentNavItem = [
  '[data-slot="sidebar-menu-button"][data-active]',
  '[data-slot="sidebar-submenu-button"][data-active]:not([data-slot="sidebar-submenu-popup"] *)',
];

export const consoleStyle: PresetStyle = {
  summary:
    'A pro tool: a tight radius ladder with 8px cards, square 4px tags and a 3px checkbox. Every surface is drawn by a hairline ring, machined with a black outer ring and a faint inner rim in dark, and the selected segment is raised by a soft top light. Table heads, sidebar group labels, menu labels and badges are set in uppercase mono, motion is snappy, the current nav item is a raised row, and the work area is a framed panel inside the rail.',
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
    'shadow-card': '0 0 0 1px rgb(20 20 40 / 0.09), 0 1px 0 0 rgb(20 20 40 / 0.03)',
    'shadow-popover': '0 0 0 1px rgb(20 20 40 / 0.12), 0 6px 20px -4px rgb(20 20 40 / 0.14)',
    'shadow-modal': '0 0 0 1px rgb(20 20 40 / 0.12), 0 24px 48px -12px rgb(20 20 40 / 0.22), 0 4px 10px -2px rgb(20 20 40 / 0.06)',
    'shadow-inset': 'inset 0 0 0 1px rgb(20 20 40 / 0.07), inset 0 1px 1px 0 rgb(20 20 40 / 0.05)',
    'shadow-lift': '0 0 0 1px var(--ring), 0 0 0 3px color-mix(in oklab, var(--ring) 18%, transparent), 0 12px 24px -8px rgb(20 20 40 / 0.2)',
    'shadow-thumb': '0 0 0 1px rgb(20 20 40 / 0.14), 0 1px 2px 0 rgb(20 20 40 / 0.14)',
  },
  dark: {
    'shadow-card': '0 0 0 1px rgb(0 0 0 / 0.55), inset 0 1px 0 0 rgb(255 255 255 / 0.035), inset 0 0 0 1px rgb(255 255 255 / 0.045)',
    'shadow-popover':
      '0 0 0 1px rgb(0 0 0 / 0.6), 0 10px 28px 0 rgb(0 0 0 / 0.5), inset 0 1px 0 0 rgb(255 255 255 / 0.05), inset 0 0 0 1px rgb(255 255 255 / 0.07)',
    'shadow-modal':
      '0 0 0 1px rgb(0 0 0 / 0.6), 0 8px 16px 0 rgb(0 0 0 / 0.3), 0 28px 56px 0 rgb(0 0 0 / 0.5), inset 0 1px 0 0 rgb(255 255 255 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.08)',
    'shadow-inset': '0 0 0 1px rgb(0 0 0 / 0.45), inset 0 1px 2px 0 rgb(0 0 0 / 0.35)',
    'shadow-lift': '0 0 0 1px var(--ring), 0 0 0 4px color-mix(in oklab, var(--ring) 22%, transparent), 0 16px 32px 0 rgb(0 0 0 / 0.5)',
    'shadow-thumb': '0 0 0 1px rgb(0 0 0 / 0.5), 0 1px 3px 0 rgb(0 0 0 / 0.5)',
  },
  css: {
    ':root': {
      '--console-frame': '#fcfcfd',
      '--console-head': '#f7f7f9',
      '--console-raise': 'linear-gradient(to bottom, transparent, rgb(20 20 40 / 0.025))',
    },
    '.dark': {
      '--console-frame': '#111114',
      '--console-head': '#16161a',
      '--console-raise': 'linear-gradient(to bottom, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0) 60%)',
    },
    body: {
      'font-variant-numeric': 'tabular-nums',
    },
    ':is([data-slot="stat-card"], [data-slot="chart-card"], [data-slot="stat-tile"], [data-slot="settings-card"], [data-slot="settings-panel"], [data-slot="danger-zone"], [data-slot="kanban-card"])': {
      'border-radius': 'calc(var(--radius) + min(var(--radius), 2px))',
    },
    ':is([data-slot="badge"], [data-slot="sidebar-menu-badge"], [data-slot="combobox-chip"])': {
      'border-radius': 'var(--radius-md)',
    },
    '[data-slot="checkbox"]': {
      'border-radius': 'calc(var(--radius) / 2)',
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
    '[data-slot="segmented-control-thumb"], [data-slot="segmented-control-item"]::before': {
      'background-image': 'var(--console-raise)',
    },
    [`${currentNavItem.join(', ')}, [data-slot="navbar-nav"] :is([aria-current="page"], [data-current])`]: raised,
    '[data-slot="tabs-indicator"], [data-slot="tabs-trigger"]::after': {
      'background-color': 'var(--ring)',
    },
    '@media screen and (width >= 48rem)': {
      '[data-slot="sidebar-inset"]': {
        margin: '0.375rem 0.375rem 0.375rem 0',
        'border-radius': 'var(--radius-xl)',
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
