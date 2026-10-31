import type { PresetStyle } from './palette.ts';

const cool = (alpha: number) => `oklch(0.3 0.02 262 / ${alpha})`;
const coolDeep = (alpha: number) => `oklch(0.3 0.03 262 / ${alpha})`;
const black = (alpha: number) => `oklch(0 0 0 / ${alpha})`;
const rim = (alpha: number) => `inset 0 1px 0 0 oklch(1 0 0 / ${alpha})`;
const primaryGlow = (alpha: number) => `color-mix(in oklab, var(--primary) ${alpha}%, transparent)`;

const pill = { 'border-radius': 'var(--soft-pill)' };
const raisedItem = { 'box-shadow': 'var(--shadow-control)' };
const tabPill = {
  'z-index': '-1',
  'border-radius': 'var(--soft-pill)',
  'background-color': 'var(--soft-tab-pill)',
};

const pills = [
  'button',
  'badge',
  'kbd',
  'input',
  'input-group',
  'combobox-input-group',
  'select-trigger',
  'date-picker-trigger',
  'number-field-group',
  'number-field-decrement',
  'number-field-increment',
  'segmented-control',
  'segmented-control-item',
  'segmented-control-thumb',
  'sidebar-menu-button',
  'sidebar-submenu-trigger',
  'sidebar-submenu-button',
  'tabs-trigger',
];

const slots = (names: string[]) => `:is(${names.map((name) => `[data-slot="${name}"]`).join(', ')})`;
const fieldFocus = `${slots(['input', 'textarea', 'select-trigger'])}:focus-visible:not([data-invalid], [aria-invalid="true"])`;
const horizontalTabs = '[data-slot="tabs-list"][data-orientation="horizontal"]';

/** Cushions on a cool paper desk: deep soft shadows instead of hairline rings, and pill controls. */
export const softStyle: PresetStyle = {
  summary:
    'Surfaces float on deep, diffuse shadows tinted the cool gray of the page instead of hairline rings, and every control, badge, key and navigation item is a pill. Titles and display type are lighter. Focus on a text field is a wide blue halo, the current item in the sidebar is a raised white pill, and a tinted pill slides under the active tab. Motion is a little slower, on a softer ease out.',
  theme: {
    'text-title--font-weight': '550',
    'text-heading--font-weight': '550',
    'text-display--font-weight': '500',
    'text-display--letter-spacing': '-0.03em',
    'text-hero--font-weight': '500',
    'text-hero--letter-spacing': '-0.045em',
    'ease-power3-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
    'transition-duration-instant': '120ms',
    'transition-duration-fast': '180ms',
    'transition-duration-base': '260ms',
    'transition-duration-overlay': '320ms',
    'transition-duration-slow': '380ms',
    'default-transition-duration': '180ms',
  },
  light: {
    'shadow-control': `0 0 0 1px ${cool(0.07)}, 0 1px 2px 0 ${cool(0.06)}, 0 4px 12px -4px ${cool(0.1)}`,
    'shadow-primary': '0 1px 2px 0 oklch(0.2 0.02 262 / 0.24), 0 6px 16px -6px oklch(0.2 0.02 262 / 0.45)',
    'shadow-primary-hover': '0 2px 4px 0 oklch(0.2 0.02 262 / 0.26), 0 8px 20px -6px oklch(0.2 0.02 262 / 0.5)',
    'shadow-card': `0 0 0 1px ${cool(0.04)}, 0 1px 2px 0 ${cool(0.04)}, 0 8px 24px -8px ${coolDeep(0.1)}, 0 24px 56px -16px ${coolDeep(0.1)}`,
    'shadow-popover': `0 0 0 1px ${cool(0.05)}, 0 8px 20px -6px ${coolDeep(0.14)}, 0 28px 64px -12px ${coolDeep(0.18)}`,
    'shadow-modal': `0 0 0 1px ${cool(0.05)}, 0 16px 32px -8px ${coolDeep(0.16)}, 0 48px 96px -24px ${coolDeep(0.28)}`,
    'shadow-inset': `inset 0 1px 3px 0 ${cool(0.08)}`,
    'shadow-field': `0 0 0 1px var(--input), 0 1px 2px 0 ${cool(0.04)}`,
    'shadow-thumb': `0 0 0 1px ${cool(0.08)}, 0 2px 6px 0 ${cool(0.16)}`,
    'shadow-lift': `0 0 0 1px color-mix(in oklab, var(--ring) 30%, transparent), 0 0 0 5px color-mix(in oklab, var(--ring) 12%, transparent), 0 12px 28px -6px ${coolDeep(0.2)}, 0 32px 64px -16px ${coolDeep(0.22)}`,
  },
  dark: {
    'shadow-control': `${rim(0.06)}, 0 0 0 1px ${black(0.28)}, 0 4px 12px -4px ${black(0.5)}`,
    'shadow-primary': `${rim(0.18)}, inset 0 -1px 0 0 ${black(0.12)}, 0 1px 2px 0 ${black(0.4)}, 0 8px 20px -8px ${primaryGlow(45)}`,
    'shadow-primary-hover': `${rim(0.18)}, inset 0 -1px 0 0 ${black(0.12)}, 0 1px 2px 0 ${black(0.4)}, 0 10px 24px -8px ${primaryGlow(55)}`,
    'shadow-card': `${rim(0.05)}, 0 0 0 1px ${black(0.25)}, 0 12px 32px -10px ${black(0.55)}, 0 32px 64px -20px ${black(0.45)}`,
    'shadow-popover': `${rim(0.07)}, 0 0 0 1px ${black(0.3)}, 0 8px 20px -6px ${black(0.5)}, 0 28px 64px -12px ${black(0.65)}`,
    'shadow-modal': `${rim(0.07)}, 0 0 0 1px ${black(0.3)}, 0 32px 80px -16px ${black(0.75)}`,
    'shadow-inset': `inset 0 1px 3px 0 ${black(0.35)}`,
    'shadow-field': '0 0 0 1px var(--input)',
    'shadow-thumb': `0 0 0 1px ${black(0.3)}, 0 2px 6px 0 ${black(0.5)}`,
    'shadow-lift': `0 0 0 1px color-mix(in oklab, var(--ring) 40%, transparent), 0 0 0 5px color-mix(in oklab, var(--ring) 16%, transparent), 0 24px 56px -12px ${black(0.7)}`,
  },
  css: {
    ':root': {
      '--soft-pill': 'min(var(--radius) * 99, var(--spacing) * 5)',
      '--soft-tab-pill': 'color-mix(in oklab, var(--primary) 10%, transparent)',
    },
    '.dark': { '--soft-tab-pill': 'color-mix(in oklab, var(--primary) 22%, transparent)' },
    [slots(pills)]: pill,
    '[data-slot="checkbox"]': { 'border-radius': '6px' },
    ':is([data-slot="dialog-popup"], [data-slot="dialog-content"], [data-slot="drawer-popup"], [data-slot="drawer-content"]):not([data-swipe-direction="up"], [data-swipe-direction="down"])':
      { 'border-radius': 'calc(var(--radius) + 12px)' },
    [fieldFocus]: { 'box-shadow': '0 0 0 1px var(--ring), 0 0 0 5px color-mix(in oklab, var(--ring) 16%, transparent)' },
    [`${slots(['sidebar-menu-button', 'sidebar-submenu-trigger'])}[data-active]`]: raisedItem,
    [`:root:not(.dark) ${slots(['sidebar-menu-button', 'sidebar-submenu-trigger'])}[data-active]`]: { 'background-color': 'var(--card)' },
    [horizontalTabs]: { isolation: 'isolate' },
    [`[data-slot="tabs-indicator"][data-orientation="horizontal"]`]: { ...tabPill, height: 'calc(100% - 10px)', bottom: '5px' },
    [`${horizontalTabs} [data-slot="tabs-trigger"]::after`]: { ...tabPill, inset: '5px 0', height: 'auto' },
    '[data-slot="table-head"]': { 'font-weight': '500' },
  },
};
