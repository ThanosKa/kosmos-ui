import type { PresetStyle } from './palette.ts';

const navItem = ':is([data-slot="sidebar-menu-button"], [data-slot="sidebar-submenu-trigger"], [data-slot="sidebar-submenu-button"])';
const valid = ':not([data-invalid], [aria-invalid="true"])';
const underlineTabs = '[data-slot="tabs-list"][data-orientation="horizontal"]:not([class*="indicator]:hidden"])';
const trackTabs = '[data-slot="tabs-list"][class*="indicator]:hidden"]';
const sideSheet = '[data-slot="drawer-content"]:is([data-swipe-direction="right"], [data-swipe-direction="left"])';

/** Pill controls, a raised key for the current place and tinted bordered tags. */
export const irisStyle: PresetStyle = {
  summary:
    'The current page in the sidebar, the selected segment and the selected view are a raised key, white in light; idle items are grey with fainter icons, and hover only darkens the text. Tags and statuses are tinted pills with a matching border, tabs are a 1px underline, and side drawers are flush full-height sheets over a blurred page.',
  theme: {
    'text-body--letter-spacing': '0em',
    'text-small--letter-spacing': '0em',
    'text-title--font-weight': '500',
    'text-title--letter-spacing': '0em',
    'transition-duration-slow': '350ms',
  },
  light: {
    'shadow-card': '0 0 0 1px #e7e7e9, 0 1px 2px 0 rgb(0 0 0 / 0.04), 0 4px 8px -2px rgb(0 0 0 / 0.04)',
    'shadow-popover': '0 0 0 1px #e7e7e9, 0 1px 2px 0 rgb(0 0 0 / 0.04), 0 4px 8px -2px rgb(0 0 0 / 0.04)',
    'shadow-modal': '0 16px 40px 0 rgb(0 0 0 / 0.12), 0 0 0 1px #e0e0e0',
    'shadow-inset': 'inset 0 0 0 1px rgb(0 0 0 / 0.03)',
    'shadow-thumb': '0 1px 2px 0 rgb(0 0 0 / 0.08), 0 0 0 1px #ededed',
    'shadow-lift': '0 0 0 1px #e7e7e9, 0 4px 6px 0 rgb(0 0 0 / 0.06), 0 12px 24px -6px rgb(0 0 0 / 0.12)',
  },
  dark: {
    'shadow-card':
      '0 4px 4px 0 rgb(42 42 42 / 0.32), 0 0 0 1px #0e0e0e, inset 0 1px 0 0 rgb(255 255 255 / 0.08), inset 0 0 0 1px rgb(255 255 255 / 0.08)',
    'shadow-popover':
      '0 4px 4px 0 rgb(42 42 42 / 0.32), 0 0 0 1px #0e0e0e, inset 0 1px 0 0 rgb(255 255 255 / 0.08), inset 0 0 0 1px rgb(255 255 255 / 0.08)',
    'shadow-modal':
      '0 16px 40px 0 rgb(0 0 0 / 0.5), 0 0 0 1px #0e0e0e, inset 0 1px 0 0 rgb(255 255 255 / 0.08), inset 0 0 0 1px rgb(255 255 255 / 0.08)',
    'shadow-inset': '0 0 0 1px rgb(0 0 0 / 0.4), inset 0 1px 2px 0 rgb(0 0 0 / 0.3)',
    'shadow-thumb': '0 0 0 1px rgb(0 0 0 / 0.4), inset 0 1px 0 0 rgb(255 255 255 / 0.1), inset 0 0 0 1px rgb(255 255 255 / 0.06)',
    'shadow-lift':
      '0 4px 4px 0 rgb(42 42 42 / 0.32), 0 0 0 1px #0e0e0e, 0 16px 40px 0 rgb(0 0 0 / 0.5), inset 0 1px 0 0 rgb(255 255 255 / 0.08), inset 0 0 0 1px rgb(255 255 255 / 0.08)',
  },
  css: {
    ':root': {
      '--iris-sidebar-block': '#f4f4f4',
      '--iris-segment-radius': 'min(var(--radius) * 99, var(--spacing) * 3.25)',
      '--iris-line-strong': '#e0e0e0',
      '--iris-subtle': '#8f8f8f',
      '--iris-icon': '#121212',
      '--iris-chip': '#525252',
      '--iris-key': '#ffffff',
      '--iris-track': '#e9e9e9',
      '--iris-segment': 'rgb(0 0 0 / 0.05)',
      '--iris-count-border': '#e0e0e0',
      '--iris-shadow-key': '0 1px 2px 0 rgb(0 0 0 / 0.06), 0 0 0 1px #ededed',
      '--iris-shadow-checked': '0 1px 2px 0 rgb(0 0 0 / 0.12), 0 0 0 1px var(--primary)',
      '--iris-shadow-sheet': '-16px 0 40px 0 rgb(0 0 0 / 0.12)',
    },
    '.dark': {
      '--iris-sidebar-block': '#181818',
      '--iris-line-strong': '#393939',
      '--iris-subtle': '#707070',
      '--iris-icon': '#d0d4dd',
      '--iris-chip': '#cfcfcf',
      '--iris-key': '#2a2a2a',
      '--iris-track': '#3a3a3a',
      '--iris-segment': 'rgb(255 255 255 / 0.08)',
      '--iris-count-border': '#414141',
      '--iris-shadow-key':
        '0 0 0 1px rgb(0 0 0 / 0.4), inset 0 1px 0 0 rgb(255 255 255 / 0.1), inset 0 0 0 1px rgb(255 255 255 / 0.06)',
      '--iris-shadow-checked': 'var(--shadow-primary)',
      '--iris-shadow-sheet': 'var(--shadow-modal)',
    },

    '::selection': { 'background-color': 'color-mix(in oklab, var(--ring) 30%, transparent)' },

    ':is([data-slot="badge"], [data-slot="checkbox"], [data-slot="switch"], [data-slot="segmented-control-item"], a:not([data-slot="button"])):focus-visible:not([class*="-outline-offset-"])':
      { 'outline-offset': '0' },

    '@media (prefers-reduced-motion: no-preference)': {
      ':is([data-slot="dialog-backdrop"], [data-slot="drawer-backdrop"])': { 'backdrop-filter': 'blur(6px)' },
    },

    '[data-slot="badge"]': {
      'font-weight': '400',
      'box-shadow': 'none',
      'border-width': '1px',
      'background-color': 'var(--tint-gray)',
      'border-color': 'var(--tint-gray-border)',
      color: 'var(--tint-gray-foreground)',
    },
    '[data-slot="badge"]::before': { content: 'none' },
    'a[data-slot="badge"]:hover': {
      'background-image': 'linear-gradient(color-mix(in oklab, currentColor 10%, transparent), color-mix(in oklab, currentColor 10%, transparent))',
    },
    '[data-slot="badge"][data-variant="blue"]': {
      'background-color': 'var(--tint-blue)',
      'border-color': 'var(--tint-blue-border)',
      color: 'var(--tint-blue-foreground)',
    },
    '[data-slot="badge"]:is([data-variant="green"], [data-variant="success"])': {
      'background-color': 'var(--tint-green)',
      'border-color': 'var(--tint-green-border)',
      color: 'var(--tint-green-foreground)',
    },
    '[data-slot="badge"]:is([data-variant="amber"], [data-variant="warning"])': {
      'background-color': 'var(--tint-amber)',
      'border-color': 'var(--tint-amber-border)',
      color: 'var(--tint-amber-foreground)',
    },
    '[data-slot="badge"]:is([data-variant="red"], [data-variant="destructive"])': {
      'background-color': 'var(--tint-red)',
      'border-color': 'var(--tint-red-border)',
      color: 'var(--tint-red-foreground)',
    },
    '[data-slot="badge"][data-variant="violet"]': {
      'background-color': 'var(--tint-violet)',
      'border-color': 'var(--tint-violet-border)',
      color: 'var(--tint-violet-foreground)',
    },
    '[data-slot="badge"][data-variant="primary"]': {
      'background-color': 'var(--primary)',
      'border-color': 'transparent',
      color: 'var(--primary-foreground)',
      'box-shadow': 'var(--shadow-primary)',
    },

    '[data-slot="sidebar-menu-badge"]': {
      'border-width': '0.5px',
      'border-color': 'var(--iris-count-border)',
      'background-color': 'var(--muted)',
      color: 'var(--iris-chip)',
      'font-weight': '400',
    },

    [`[data-slot="checkbox"]${valid}`]: { 'box-shadow': 'none' },
    '[data-slot="checkbox"]': {
      'border-radius': 'var(--radius-sm)',
      'border-color': 'var(--iris-line-strong)',
      'background-color': 'transparent',
      color: 'var(--primary-foreground)',
    },
    '[data-slot="checkbox"]:hover:not([data-checked], [data-indeterminate], [data-disabled])': {
      'border-color': 'var(--iris-subtle)',
      'background-color': 'transparent',
    },
    '[data-slot="checkbox"]:is([data-checked], [data-indeterminate])': {
      'border-color': 'var(--primary)',
      'background-color': 'var(--primary)',
    },

    [`[data-slot="radio-card"][data-checked]${valid}`]: { 'box-shadow': '0 0 0 1px var(--primary), var(--shadow-control)' },
    [`[data-slot="radio-card"][data-checked]${valid} [data-slot="radio-card-mark"]`]: { 'box-shadow': 'var(--iris-shadow-checked)' },

    '[data-slot="sidebar-header"], [data-slot="sidebar-footer"]': { 'background-color': 'var(--iris-sidebar-block)' },
    '[data-slot="sidebar-group-label"]': { 'font-weight': '500', 'letter-spacing': '1px' },
    [navItem]: { 'border-radius': 'var(--radius)', color: 'var(--muted-foreground)' },
    [`${navItem} svg`]: { color: 'var(--iris-subtle)', transition: 'color 150ms var(--ease-power3-out)' },
    [`${navItem}:hover:not([data-disabled])`]: {
      'background-color': 'transparent',
      color: 'var(--foreground)',
    },
    [`${navItem}:hover svg, ${navItem}[data-active] svg`]: { color: 'var(--iris-icon)' },
    [`${navItem}[data-active], ${navItem}[data-active]:hover:not([data-disabled])`]: {
      'background-color': 'var(--iris-key)',
      color: 'var(--foreground)',
      'box-shadow': 'var(--iris-shadow-key)',
    },

    [`${underlineTabs} > [data-slot="tabs-trigger"]`]: { 'font-weight': '400' },
    [`${underlineTabs} > [data-slot="tabs-trigger"][data-active]`]: { color: 'var(--foreground)', 'font-weight': '500' },
    [`${underlineTabs} > [data-slot="tabs-trigger"]::after`]: { height: '1px', 'background-color': 'var(--primary)' },
    '[data-slot="tabs-indicator"][data-orientation="horizontal"]': { height: '1px', 'background-color': 'var(--primary)' },

    [`${trackTabs}`]: { 'background-color': 'var(--iris-segment)', 'box-shadow': 'none' },
    [`${trackTabs} > [data-slot="tabs-trigger"]:hover:not([data-active])`]: { 'background-color': 'transparent' },
    [`${trackTabs} > [data-slot="tabs-trigger"][data-active]`]: {
      'background-color': 'var(--iris-key)',
      'box-shadow': 'var(--iris-shadow-key)',
      color: 'var(--foreground)',
    },

    '[data-slot="segmented-control"]': {
      'border-radius': 'calc(var(--iris-segment-radius) + min(var(--radius), 3px))',
      'background-color': 'var(--iris-segment)',
      'box-shadow': 'none',
    },
    '[data-slot="segmented-control-item"]': {
      'border-radius': 'var(--iris-segment-radius)',
      'font-weight': '400',
    },
    '[data-slot="segmented-control-item"][data-checked]': { color: 'var(--foreground)', 'font-weight': '500' },
    '[data-slot="segmented-control-item"]::before, [data-slot="segmented-control-thumb"]': {
      'border-radius': 'var(--iris-segment-radius)',
      'background-color': 'var(--iris-key)',
      'box-shadow': 'var(--iris-shadow-key)',
    },

    '[data-slot="table-body"] [data-slot="table-row"]:hover': {
      'background-color': 'color-mix(in srgb, var(--card) 60%, transparent)',
    },
    '[data-slot="table-row"][data-state="selected"]': { 'background-color': 'var(--card)' },

    ':is([data-slot="stat-card"], [data-slot="chart-card"], [data-slot="panel"])': { 'border-radius': 'var(--radius)' },
    '[data-slot="panel-content"]': { 'border-radius': 'calc(var(--radius) - 4px)' },

    [sideSheet]: {
      'inset-block': '0',
      'border-radius': '0',
      'box-shadow': 'var(--iris-shadow-sheet)',
    },
    '[data-slot="drawer-content"][data-swipe-direction="right"]': {
      right: '0',
      'border-inline-start-color': 'var(--iris-line-strong)',
    },
    '[data-slot="drawer-content"][data-swipe-direction="left"]': {
      left: '0',
      'border-inline-end-color': 'var(--iris-line-strong)',
    },
    ':is([data-slot="drawer-header"], [data-slot="dialog-header"], [data-slot="drawer-footer"], [data-slot="dialog-footer"])': {
      'border-color': 'var(--iris-line-strong)',
    },

    '[data-slot="meter-segments"] > *': { 'border-radius': '1px' },
    '[data-slot="meter-segments"] > :not([data-filled])': { 'background-color': 'var(--iris-track)' },
    '[data-slot="meter-bar"]': { 'background-color': 'var(--iris-track)', 'box-shadow': 'none' },

    '[data-slot="avatar"]': { 'box-shadow': 'var(--shadow-control)' },
    '[data-slot="avatar-fallback"]': { 'background-color': 'var(--muted)', color: 'var(--muted-foreground)' },

    '[data-slot="kbd"]': {
      'box-shadow': 'none',
      'border-width': '0.5px',
      'border-color': 'var(--iris-count-border)',
      'background-color': 'var(--muted)',
      color: 'var(--iris-chip)',
    },
  },
};
