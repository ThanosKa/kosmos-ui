import type { CssRules } from './palette.ts';

/** Rules in the shape of shadcn's registry `css` field, written out as CSS. */
export function cssRulesText(rules: CssRules, depth = 0): string {
  const pad = '  '.repeat(depth);
  return Object.entries(rules)
    .map(([selector, body]) => {
      const lines = Object.entries(body).map(([key, value]) =>
        typeof value === 'string' ? `${pad}  ${key}: ${value};` : cssRulesText({ [key]: value }, depth + 1),
      );
      return `${pad}${selector} {\n${lines.join('\n')}\n${pad}}`;
    })
    .join('\n\n');
}

/** Every declaration in the rules, with the at-rules and the selector it sits under, outermost first. */
export function cssDeclarations(rules: CssRules, within: string[] = []): { within: string[]; property: string; value: string }[] {
  return Object.entries(rules).flatMap(([selector, body]) =>
    Object.entries(body).flatMap(([key, value]) =>
      typeof value === 'string'
        ? [{ within: [...within, selector], property: key, value }]
        : cssDeclarations({ [key]: value }, [...within, selector]),
    ),
  );
}
