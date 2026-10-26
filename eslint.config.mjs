import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const kosmosVariant = (prop) =>
  `:matches(JSXOpeningElement[name.name='Button'] > JSXAttribute[name.name='${prop}'], CallExpression[callee.name='buttonVariants'] Property[key.name='${prop}'])`;

const kosmosSelectors = [
  {
    selector: "JSXOpeningElement[name.name='Button']:not(:has(JSXAttribute[name.name='variant']))",
    message: 'Pass `variant` explicitly on every <Button> (kosmos-style).',
  },
  {
    selector: "JSXOpeningElement[name.name='button']",
    message: 'Use the Kosmos <Button variant="..."> instead of a raw <button> (kosmos-style).',
  },
  {
    selector: `${kosmosVariant('variant')} Literal[value=/^(default|outline|link)$/]`,
    message: 'Use the Kosmos variant (`primary` for `default`, `secondary` for `outline`; a plain link for `link`); shadcn names are aliases for installed copies only (kosmos-style).',
  },
  {
    selector: `${kosmosVariant('size')} Literal[value=/^(default|xs|icon-xs)$/]`,
    message: 'Use the Kosmos size (`md` for `default`, `sm` for `xs`, `icon-sm` for `icon-xs`); shadcn names are aliases for installed copies only (kosmos-style).',
  },
];

// A color in registry code: a Tailwind palette class (`text-orange-500`), a color function, or a hex value. Black and
// white stay allowed for the image edge the style prescribes (`outline-black/10`). A short hex needs a letter in it,
// so `#482` in "Run #482" is not a color.
const paletteFamilies = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const colorPatterns = [
  `\\b(text|bg|border|ring|outline|fill|stroke|from|via|to|divide|shadow|decoration|accent|caret|placeholder)-(${paletteFamilies})-[0-9]{2,3}\\b`,
  '\\b(rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\\(',
  '#[0-9a-fA-F]{6}\\b',
  '#[0-9a-fA-F]{8}\\b',
  '#(?=[0-9]*[a-fA-F])[0-9a-fA-F]{3,4}\\b',
];
const colorMessage = 'Take colors from the tokens (`bg-primary`, `text-muted-foreground`); registry code has no color literals or palette classes (kosmos-style).';
const colorSelectors = colorPatterns.flatMap((pattern) => [
  { selector: `Literal[value=/${pattern}/]`, message: colorMessage },
  { selector: `TemplateElement[value.raw=/${pattern}/]`, message: colorMessage },
]);

/**
 * Lints the tsx code blocks of the docs pages, so the samples a reader copies follow the same rules. A block of bare
 * JSX is wrapped in a fragment, since a sample may list several elements side by side.
 */
const fencePattern = /^[ \t]*```tsx[^\n]*\n([\s\S]*?)^[ \t]*```/gm;
const fenceLines = new Map();
const mdxCodeBlocks = {
  meta: { name: 'mdx-code-blocks' },
  preprocess(text, filename) {
    const blocks = [...text.matchAll(fencePattern)].map((fence) => {
      const line = text.slice(0, fence.index).split('\n').length;
      return /^\s*</.test(fence[1]) ? { code: `<>\n${fence[1]}</>`, line: line - 1 } : { code: fence[1], line };
    });
    fenceLines.set(
      filename,
      blocks.map((block) => block.line),
    );
    return blocks.map((block, index) => ({ text: block.code, filename: `${index}.tsx` }));
  },
  postprocess(messages, filename) {
    const lines = fenceLines.get(filename);
    return messages.flatMap((list, index) =>
      list.map((message) => ({ ...message, line: message.line + lines[index], endLine: message.endLine && message.endLine + lines[index] })),
    );
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  { files: ['content/**/*.mdx'], processor: mdxCodeBlocks },
  { files: ['content/**/*.mdx/*.tsx'], rules: { 'react/jsx-no-undef': 'off' } },
  {
    // kosmos-style: every Button in Kosmos code passes `variant`, and clickable controls are Buttons.
    // (Installed copies keep `variant` optional, so apps that replace shadcn's Button still build.)
    // shadcn's names are aliases for apps that swap in our Button; Kosmos code uses the Kosmos names.
    rules: {
      'no-restricted-syntax': ['error', ...kosmosSelectors],
    },
  },
  {
    // Registry code takes every color from the tokens. The token files are the one place a color value is written.
    files: ['registry/**/*.{ts,tsx}'],
    ignores: ['registry/**/tokens.*', 'registry/kosmos/styles/**'],
    rules: { 'no-restricted-syntax': ['error', ...kosmosSelectors, ...colorSelectors] },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.source/**',
    '.claude/**',
    '.scratch/**',
    'public/r/**',
  ]),
]);

export default eslintConfig;
