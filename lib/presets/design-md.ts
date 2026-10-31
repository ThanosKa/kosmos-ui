import { cssRulesText } from './css.ts';
import { paletteSections, presetPalette, type PaletteToken, type Preset } from './palette.ts';

const uses: Record<PaletteToken, string> = {
  background: 'The page.',
  foreground: 'Text on the page: headings, values, a hovered item.',
  card: 'Cards, stat tiles and board cards.',
  'card-foreground': 'Text on a card.',
  popover: 'Popovers, menus, tooltips, toasts, dialogs and drawers.',
  'popover-foreground': 'Text in a popover, menu or dialog.',
  primary: 'The one filled action per view, a checked checkbox or radio, a switch that is on, the slider range and the tabs indicator. The accent in a preset with one.',
  'primary-foreground': 'Text and icons on a primary fill: 4.5:1 on it, also under its hover.',
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
  'accent-text': 'The label and icon of the current page in navigation, and a Meter in its primary tone.',
  scrim: 'The backdrop behind dialogs and drawers.',
  thumb: 'Switch and slider thumbs.',
  'scrollbar-thumb': 'The scrollbar thumb, lighter than muted text.',
  sidebar: 'The sidebar surface.',
  'sidebar-foreground': 'Sidebar text and a hovered sidebar item.',
  'sidebar-primary': 'A filled mark in the sidebar, like the workspace initial. The same value as primary.',
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

const table = (preset: Preset, tokens: readonly PaletteToken[]) => {
  const [light, dark] = [presetPalette(preset, 'light'), presetPalette(preset, 'dark')];
  return [
    '| Token | Light | Dark | Use |',
    '| --- | --- | --- | --- |',
    ...tokens.map((token) => `| \`${token}\` | \`${light[token]}\` | \`${dark[token]}\` | ${uses[token]} |`),
  ].join('\n');
};

function accentSection({ accent }: Preset) {
  if (!accent) {
    return 'This preset has no accent: buttons and every checked control, focus, the current page in navigation and meters are ink, so color is left to status, destructive and the chart series.';
  }
  return `This preset's one accent fills every primary control (\`primary\`, \`sidebar-primary\`): the primary button, a checked checkbox or radio, a switch that is on, the slider range, the tabs indicator and a done step. It also colors focus (\`ring\`, \`sidebar-ring\`), the current page in navigation and the Meter's primary tone (\`accent-text\`). Nothing else takes it: links and every other text stay ink or gray.

| Step | Light | Dark | Use |
| --- | --- | --- | --- |
| Primary | \`${accent.light.primary}\` | \`${accent.dark.primary}\` | \`primary\` and \`sidebar-primary\`: a fill under \`primary-foreground\`. |
| On primary | \`${accent.light.onPrimary}\` | \`${accent.dark.onPrimary}\` | \`primary-foreground\`: 4.5:1 on the fill and under its 90% hover. White in both modes: in dark the fill is a deep step of the accent. |
| Ring | \`${accent.light.ring}\` | \`${accent.dark.ring}\` | Focus: a mark, 3:1 on every surface. |
| Text | \`${accent.light.text}\` | \`${accent.dark.text}\` | \`accent-text\`: 4.5:1 on every surface a nav item sits on. |`;
}

const tokenTable = (values: Record<string, string>) =>
  ['| Token | Value |', '| --- | --- |', ...Object.entries(values).map(([token, value]) => `| \`${token}\` | \`${value}\` |`)].join('\n');

function styleSection({ style }: Preset) {
  if (!style) return '';
  const modes = (['light', 'dark'] as const).filter((mode) => style[mode] && Object.keys(style[mode]).length);
  return `
## Style

${style.summary}
${style.theme ? `\nThe same in light and dark, set in \`@theme inline\`:\n\n${tokenTable(style.theme)}\n` : ''}${modes.map((mode) => `\n${mode === 'light' ? 'Light' : 'Dark'}, on \`${mode === 'light' ? ':root' : '.dark'}\`:\n\n${tokenTable(style[mode]!)}\n`).join('')}${
    style.css
      ? `\nThe components take these rules by their \`data-slot\`. Keep them after the tokens and outside any \`@layer\`: they hold the preset's shapes, and outside a layer they win over the Tailwind classes in the components.\n\n\`\`\`css\n${cssRulesText(style.css)}\n\`\`\`\n`
      : ''
  }`;
}

/** The preset as a DESIGN.md for an agent: every value, the radius, the style, the focus rule and what to do and avoid. */
export function presetDesignMd(preset: Preset): string {
  const scope = preset.style
    ? 'It sets the palette, the radius and its own style: shadows, type weights, motion and the shape of the components. Fonts, text sizes and the size of every component stay the Kosmos ones.'
    : 'It sets the palette and the radius only: fonts, sizes, shadows and motion belong to the Kosmos style and stay the same under every preset.';
  return `# ${preset.name} preset

${preset.description}

This is a Kosmos UI preset. ${scope} Every color is a CSS variable with its shadcn name, light on \`:root\` and dark on \`.dark\`, and components reach it through its Tailwind class (\`bg-card\`, \`text-muted-foreground\`, \`outline-ring\`), never a literal.

## Palette

${table(preset, paletteSections.base)}

### Sidebar

${table(preset, paletteSections.sidebar)}

### Chart

${table(preset, paletteSections.chart)}

## Accent

${accentSection(preset)}

## Radius and size

| Token | Value | Use |
| --- | --- | --- |
| \`radius\` | \`${preset.radius}\` | The base of the radius scale. Controls take \`rounded-lg\` (the radius), overlays \`rounded-xl\` (4px more), cards \`rounded-2xl\` (6px more), menu items inside a popup \`rounded-lg\`, and the 16px checkbox \`rounded-sm\` (6px less). |
| \`spacing\` | \`${preset.spacing ?? '0.25rem'}\` | The unit of every height, padding and gap: a button is 7.5 units tall, a text field 8.5. Text sizes do not follow it. |
${styleSection(preset)}
## Focus

Every focusable element shows a 2px \`outline-ring\` outline, offset 2px, so the shadow of its surface stays intact. Text fields light their own edge instead: a 1px \`ring\` line with a 3px \`ring\` halo at 20%. \`ring\` keeps 3:1 against the page, cards, popovers and secondary surfaces in both modes, and \`sidebar-ring\` does the same on the sidebar.

## Do

- Give each view one filled \`primary\` action; its peers take the secondary or ghost look. Put only \`primary-foreground\` on a primary fill.
- Keep text in \`foreground\` or \`muted-foreground\`. Both pass 4.5:1 on every surface.
- Mark the current page in navigation with \`accent-text\`, on the flat \`accent\` hover fill.
- Highlight hovered items with \`accent\`, the see-through fill that works on every surface.
- Pair \`success\`, \`warning\` and \`destructive\` with a label or an icon, so the meaning never rides on color alone.
- Use \`chart-1\` to \`chart-5\` in order, and fold a sixth series and beyond into "Other". They are the same five colors under every preset.
- Draw a surface's edge with its Kosmos shadow token and the line between items with \`border\`.

## Don't

- Color text with \`ring\` or a chart color: they are made for 3:1 marks, not 4.5:1 text.
- Use \`accent-text\` for anything but the current page in navigation, a primary Meter and decorative glows and grids.
- Fill a button or a large surface with \`ring\`: fills take \`primary\`.
- Let a hover take the \`ring\` color: that color means focus.
- Add a gray fainter than \`muted-foreground\` for text.
- Write a color literal in a component: every color goes through its token.
`;
}
