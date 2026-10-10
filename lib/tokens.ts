import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type TokenBlock = 'themeInline' | 'theme' | 'light' | 'dark';
export type Declarations = Record<string, string>;
export type KosmosTokens = Record<TokenBlock, Declarations>;

const tokensPath = join(process.cwd(), 'registry/kosmos/styles/tokens.css');

const blockSelectors: Record<TokenBlock, string> = {
  themeInline: '@theme inline',
  theme: '@theme static',
  light: ':root',
  dark: '.dark',
};

function parseBlock(css: string, selector: string): Declarations {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) return {};
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  const body = css.slice(open + 1, close);
  const declarations: Declarations = {};
  for (const part of body.split(';')) {
    const match = /^\s*--([\w-]+)\s*:\s*([\s\S]+?)\s*$/.exec(part);
    if (match) declarations[match[1]] = match[2].replace(/\s+/g, ' ');
  }
  return declarations;
}

/** Reads the token declarations straight from the CSS source, grouped the way a registry item's `cssVars` expects. */
export function readKosmosTokens(): KosmosTokens {
  const css = readFileSync(tokensPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  return {
    themeInline: parseBlock(css, blockSelectors.themeInline),
    theme: parseBlock(css, blockSelectors.theme),
    light: parseBlock(css, blockSelectors.light),
    dark: parseBlock(css, blockSelectors.dark),
  };
}

/**
 * The tokens as a shadcn registry item's `cssVars`. The CLI writes `theme` into the user's
 * `@theme inline`, so references between `@theme static` values are resolved here (inline
 * theme vars do not exist at runtime). Font families stay with the user's app.
 */
export function kosmosTokensAsCssVars(tokens: KosmosTokens = readKosmosTokens()) {
  const resolve = (value: string): string =>
    value.replace(/var\(--([\w-]+)\)/g, (ref, name: string) =>
      name in tokens.theme ? resolve(tokens.theme[name]) : ref,
    );
  const theme: Declarations = {};
  for (const [name, value] of Object.entries(tokens.themeInline)) {
    if (!name.startsWith('font-')) theme[name] = value;
  }
  for (const [name, value] of Object.entries(tokens.theme)) theme[name] = resolve(value);
  return { theme, light: tokens.light, dark: tokens.dark };
}
