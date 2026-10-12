import type { getHighlighter } from 'fumadocs-core/highlight';

type ThemeRegistration = Exclude<NonNullable<NonNullable<Parameters<typeof getHighlighter>[1]>['themes']>[number], string>;

/**
 * The syntax colors of every docs code block, light and dark. Shiki needs plain colors, so each one is written in
 * hex, converted from an OKLCH value on the chart and tag hues: text and comments are the `foreground` and
 * `muted-foreground` tokens, the rest share one lightness per mode. Every color reaches at least 5:1 on `card`,
 * the code block surface, and on `background` (checked with the WCAG 2 formula).
 */
const palettes = {
  light: {
    background: '#fcfcfa',
    text: '#26251e',
    comment: '#6a6963',
    punctuation: '#57554f',
    keyword: '#953490',
    string: '#0b764d',
    function: '#1e65aa',
    tag: '#ac3228',
    attribute: '#7f5d09',
  },
  dark: {
    background: '#1e1d1a',
    text: '#f5f5f2',
    comment: '#a09e99',
    punctuation: '#afaea8',
    keyword: '#e39bdc',
    string: '#7ad4a5',
    function: '#80bdfb',
    tag: '#f49286',
    attribute: '#eec474',
  },
} as const;

type Palette = (typeof palettes)[keyof typeof palettes];

function kosmosTheme(name: string, type: 'light' | 'dark', color: Palette): ThemeRegistration {
  return {
    name,
    type,
    colors: { 'editor.background': color.background, 'editor.foreground': color.text },
    tokenColors: [
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: color.comment, fontStyle: 'italic' } },
      { scope: ['punctuation', 'meta.brace', 'meta.delimiter'], settings: { foreground: color.punctuation } },
      {
        scope: ['keyword', 'storage', 'storage.type', 'keyword.operator.new', 'keyword.control', 'variable.language'],
        settings: { foreground: color.keyword },
      },
      { scope: ['keyword.operator', 'keyword.operator.assignment'], settings: { foreground: color.punctuation } },
      {
        scope: ['string', 'string.template', 'punctuation.definition.string', 'markup.inline.raw'],
        settings: { foreground: color.string },
      },
      {
        scope: [
          'entity.name.function',
          'support.function',
          'meta.function-call entity.name.function',
          'constant.numeric',
          'constant.language',
          'support.constant',
          'variable.other.constant',
          'support.type.property-name',
        ],
        settings: { foreground: color.function },
      },
      {
        scope: ['entity.name.tag', 'support.class.component', 'entity.name.type', 'entity.name.class', 'support.type'],
        settings: { foreground: color.tag },
      },
      {
        scope: ['entity.other.attribute-name', 'variable.parameter', 'meta.object-literal.key', 'support.type.property-name.css'],
        settings: { foreground: color.attribute },
      },
      { scope: ['markup.heading', 'markup.bold'], settings: { foreground: color.text, fontStyle: 'bold' } },
    ],
  };
}

/** Shiki options for the docs: the two Kosmos themes, switched by the page's light or dark mode. */
export const codeThemes = {
  themes: {
    light: kosmosTheme('kosmos-light', 'light', palettes.light),
    dark: kosmosTheme('kosmos-dark', 'dark', palettes.dark),
  },
  defaultColor: false,
} as const;
