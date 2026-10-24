import { paletteSections, type PaletteToken, type Preset } from './palette.ts';

const uses: Record<PaletteToken, string> = {
  background: 'The page.',
  foreground: 'Text on the page: headings, values, a hovered item.',
  card: 'Cards, stat tiles and board cards.',
  'card-foreground': 'Text on a card.',
  popover: 'Popovers, menus, tooltips, toasts, dialogs and drawers.',
  'popover-foreground': 'Text in a popover, menu or dialog.',
  primary: 'The one filled action per view, a checked checkbox, a switch that is on.',
  'primary-foreground': 'Text and icons on a primary fill.',
  secondary: 'Secondary buttons and text fields.',
  'secondary-foreground': 'Text on a secondary button.',
  muted: 'Tracks and quiet fills: segmented control, switch, meter.',
  'muted-foreground': 'Secondary text and idle chrome. The faintest text there is.',
  accent: 'The see-through hover on ghost buttons, nav items, menu items and rows.',
  'accent-foreground': 'Text on a hovered item.',
  destructive: 'Destructive actions and errors, as text, icons and dots.',
  success: 'Dots, icons and meter segments that mean done or healthy.',
  warning: 'Dots, icons and meter segments that need attention.',
  border: 'Dividers between list, menu and table items.',
  input: 'The edge of a text field.',
  ring: 'Focus outlines.',
  'active-foreground': 'The label and icon of the current page in navigation.',
  scrim: 'The backdrop behind dialogs and drawers.',
  thumb: 'Switch and slider thumbs.',
  'scrollbar-thumb': 'The scrollbar thumb, lighter than muted text.',
  'meter-primary': 'A Meter in its primary tone.',
  sidebar: 'The sidebar surface.',
  'sidebar-foreground': 'Sidebar text and a hovered sidebar item.',
  'sidebar-primary': 'A filled mark in the sidebar, like the workspace initial.',
  'sidebar-primary-foreground': 'Text on a sidebar-primary fill.',
  'sidebar-accent': 'The hover on sidebar items.',
  'sidebar-accent-foreground': 'Text on a hovered sidebar item.',
  'sidebar-border': 'The line between the sidebar and the page, and between its groups.',
  'sidebar-ring': 'Focus outlines inside the sidebar.',
  'chart-1': 'The first chart series.',
  'chart-2': 'The second chart series.',
  'chart-3': 'The third chart series.',
  'chart-4': 'The fourth chart series.',
  'chart-5': 'The fifth chart series. More than five fold into "Other".',
};

const table = (preset: Preset, tokens: readonly PaletteToken[]) =>
  [
    '| Token | Light | Dark | Use |',
    '| --- | --- | --- | --- |',
    ...tokens.map((token) => `| \`${token}\` | \`${preset.light[token]}\` | \`${preset.dark[token]}\` | ${uses[token]} |`),
  ].join('\n');

/** The preset as a DESIGN.md for an agent: every value, the radius, the focus rule and what to do and avoid. */
export function presetDesignMd(preset: Preset): string {
  return `# ${preset.name} preset

${preset.description}

This is a Kosmos UI preset. It sets the palette and the radius only: fonts, density, shadows and motion belong to the Kosmos style and stay the same under every preset. Every color is a CSS variable with its shadcn name, light on \`:root\` and dark on \`.dark\`, and components reach it through its Tailwind class (\`bg-card\`, \`text-muted-foreground\`, \`outline-ring\`), never a literal.

## Palette

${table(preset, paletteSections.base)}

### Sidebar

${table(preset, paletteSections.sidebar)}

### Chart

${table(preset, paletteSections.chart)}

## Radius

| Token | Value | Use |
| --- | --- | --- |
| \`radius\` | \`${preset.radius}\` | The base of the radius scale. Controls take \`rounded-lg\` (the radius), overlays \`rounded-xl\` (4px more), cards \`rounded-2xl\` (6px more), menu items inside a popup \`rounded-lg\`, and the 16px checkbox \`rounded-sm\` (6px less). |

## Focus

Every focusable element shows a 2px \`outline-ring\` outline, offset 2px, so the shadow of its surface stays intact. Text fields light their own edge instead: a 1px \`ring\` line with a 3px \`ring\` halo at 20%. \`ring\` keeps 3:1 against the page, cards, popovers and secondary surfaces in both modes, and \`sidebar-ring\` does the same on the sidebar.

## Do

- Give each view one filled \`primary\` action; its peers take the secondary or ghost look.
- Keep text in \`foreground\` or \`muted-foreground\`. Both pass 4.5:1 on every surface.
- Mark the current page in navigation with \`active-foreground\`, on the flat \`accent\` hover fill.
- Highlight hovered items with \`accent\`, the see-through fill that works on every surface.
- Pair \`success\`, \`warning\` and \`destructive\` with a label or an icon, so the meaning never rides on color alone.
- Use \`chart-1\` to \`chart-5\` in order, and fold a sixth series and beyond into "Other".
- Draw a surface's edge with its Kosmos shadow token and the line between items with \`border\`.

## Don't

- Color text with \`ring\` or a chart color: they are made for 3:1 marks, not 4.5:1 text.
- Fill a button or a large surface with \`ring\`.
- Let a hover take the \`ring\` color: that color means focus.
- Add a grey fainter than \`muted-foreground\` for text.
- Write a color literal in a component: every color goes through its token.
`;
}
