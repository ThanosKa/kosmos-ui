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

// Transitions name their properties. A bare `transition` or `transition-all` animates whatever changes, layout included.
// The class is matched as a whole word, so `transition-colors` and `transition-[opacity,transform]` pass.
const transitionPattern = '(^|[\\s"\'`])transition(-all)?($|[\\s"\'`])';
const transitionMessage = 'Name the properties a transition animates (`transition-colors`, `transition-[opacity,transform]`); no bare `transition` or `transition-all` (kosmos-style).';
const transitionSelectors = [
  { selector: `Literal[value=/${transitionPattern}/]`, message: transitionMessage },
  { selector: `TemplateElement[value.raw=/${transitionPattern}/]`, message: transitionMessage },
];

// A class is matched after a space, a quote or a variant (`hover:`), so `ease-out` is caught inside `hover:ease-out`
// while `ease-power3-out` and `text-small` pass. A `/` is written `\x2f`, since a selector regex cannot hold one.
const classStart = `(^|[\\s"'\`:])`;
const classEnd = `($|[\\s"'\`]|\\x2f)`;
const classSelectors = (pattern, message) => [
  { selector: `Literal[value=/${pattern}/]`, message },
  { selector: `TemplateElement[value.raw=/${pattern}/]`, message },
];

const easeSelectors = classSelectors(
  `${classStart}ease-(in|out|in-out)${classEnd}`,
  'Use the Kosmos curves (`ease-power3-out`, `ease-smooth-in-out`), not `ease-in`, `ease-out` or `ease-in-out` (kosmos-style).',
);

// `duration-0` stays allowed for a change that must not animate.
const durationSelectors = classSelectors(
  `${classStart}duration-([1-9][0-9]*|\\[[^\\]]*\\])${classEnd}`,
  'Use a duration token (`duration-instant`, `duration-fast`, `duration-base`, `duration-slow`), not a number (kosmos-style).',
);

const textSizeSelectors = classSelectors(
  `${classStart}text-(xs|sm|lg|[2-9]?xl|\\[[0-9.]+(px|rem|em)\\])${classEnd}`,
  'Use a type role (`text-caption`, `text-small`, `text-body`, `text-title`), not a Tailwind or arbitrary text size (kosmos-style).',
);

const blurSelectors = classSelectors(
  `${classStart}backdrop-blur`,
  'Sticky chrome and overlays sit on an opaque fill (`bg-background`), with no `backdrop-blur` (kosmos-style).',
);

const pressSelectors = classSelectors(
  `(^|[\\s"'\`])(?!motion-safe:not-disabled:not-data-disabled:active:scale-96($|[\\s"'\`]))[^\\s"'\`]*active:scale-`,
  'The press scale is `motion-safe:not-disabled:not-data-disabled:active:scale-96` exactly (kosmos-style).',
);

// Only marks take the focus and chart colors; text stays ink or muted.
const markColorSelectors = classSelectors(
  `${classStart}text-(ring|sidebar-ring|chart-[1-5])${classEnd}`,
  'Text takes `text-foreground` or `text-muted-foreground`; `ring` and `chart-*` color marks, not text (kosmos-style).',
);

// `h-screen` and `vh` ignore the phone's browser bars; `svh` does not.
const viewportSelectors = classSelectors(
  `(${classStart}(min-|max-)?h-screen${classEnd}|[0-9]vh)`,
  'Size full-height layouts in `svh` (`min-h-svh`, `h-svh`), not `h-screen` or `vh` (kosmos-style, Phones).',
);

// Components import `cn` from the one file that owns it, not from the libraries it wraps.
const cnMessage = 'Import `cn` from `@/registry/kosmos/lib/cn`, not from `clsx`, `tailwind-merge` or `cn` (kosmos-style).';
const cnSelectors = ['clsx', 'tailwind-merge', 'cn'].map((source) => ({
  selector: `ImportDeclaration[source.value=/^${source}(\\/.*)?$/]`,
  message: cnMessage,
}));

// An inline `style` holds CSS custom properties only; every other property is a class.
const styleSelectors = [
  {
    selector: "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression > Property[key.type='Identifier']",
    message: 'An inline `style` may only set CSS custom properties (`--name`); use a class for the rest (kosmos-style).',
  },
  {
    selector: "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression > Property[key.type='Literal'][key.value!=/^--/]",
    message: 'An inline `style` may only set CSS custom properties (`--name`); use a class for the rest (kosmos-style).',
  },
  {
    selector:
      "JSXAttribute[name.name='style'] > JSXExpressionContainer :matches(ConditionalExpression, LogicalExpression) > ObjectExpression > Property[key.type='Identifier']",
    message: 'An inline `style` may only set CSS custom properties (`--name`); use a class for the rest (kosmos-style).',
  },
  {
    selector:
      "JSXAttribute[name.name='style'] > JSXExpressionContainer :matches(ConditionalExpression, LogicalExpression) > ObjectExpression > Property[key.type='Literal'][key.value!=/^--/]",
    message: 'An inline `style` may only set CSS custom properties (`--name`); use a class for the rest (kosmos-style).',
  },
];

// The docs, the site and the blocks scroll in a `ScrollArea`. The docs code block viewport is the one exception: it is a
// focusable region whose scroll axes, collapse height and copy text are measured on the element itself.
const scrollSelectors = classSelectors(
  `${classStart}overflow-(x-|y-)?auto${classEnd}`,
  'Content in the docs, the site and the blocks scrolls in a `ScrollArea`, which keeps the scrollbar, edge fade and focus ring on the Kosmos style (kosmos-style, Overflow). The docs code block viewport is the one exception.',
);

// Copying goes through one hook, so a refused clipboard says so instead of failing silently.
const copyHookMessage =
  'Copy through `useDocsCopy` (`components/docs/use-docs-copy.ts`), which reports a failed copy; no `navigator.clipboard` or `useCopyButton` in components.';
const copyHookSelectors = [
  { selector: "MemberExpression[object.name='navigator'][property.name='clipboard']", message: copyHookMessage },
  { selector: "CallExpression[callee.name='useCopyButton']", message: copyHookMessage },
];

// An overlay's scroll area spans its full width, so its focus ring would land on the overlay's edge. The bodies set it
// in from the edge; a scroll area inside a body is one list among the content and keeps the usual ring.
const overlayContent = "JSXElement[openingElement.name.name=/^(Dialog|Drawer|Popover)Content$/]";
const overlayBody = "JSXElement[openingElement.name.name=/^(Dialog|Drawer)Body$/]";
const overlayScrollSelectors = [
  {
    selector: `${overlayContent} JSXElement[openingElement.name.name='ScrollArea']:not(${overlayBody} JSXElement)`,
    message:
      "A scroll area in an overlay goes in `DialogBody` or `DrawerBody`, which keep its focus ring inside, clear of the overlay's edge; `PopoverContent` already scrolls its content, so drop the `ScrollArea` (kosmos-style, Focus).",
  },
];

// Sticky chrome is opaque: a `bg-*` with an opacity on the same element lets the page show through its text.
const stickyTranslucentSelectors = classSelectors(
  `^(?=[\\s\\S]*${classStart}(@[a-z0-9]+:)?sticky${classEnd})(?=[\\s\\S]*${classStart}bg-[a-z-]+\\x2f[0-9])`,
  'Sticky chrome sits on an opaque fill (`bg-background`), not a translucent `bg-*/NN` (kosmos-style, Surfaces: shadows, not borders).',
);

// A link that looks like a button is a Button, so a preset's rules, which skip Buttons, skip it too.
const buttonVariantsLinkSelectors = [
  {
    selector:
      "JSXOpeningElement[name.name!='Button'] > JSXAttribute[name.name='className'] > JSXExpressionContainer > CallExpression[callee.name='buttonVariants']",
    message:
      'Render a link as a button through `Button` (`<Button variant="primary" nativeButton={false} render={<Link href=… />}>`), so presets treat it as a Button (kosmos-style, Buttons).',
  },
];

// An icon-only Button names its action in `aria-label`, `aria-labelledby` or a `sr-only` child. A spread may carry it,
// and a Button given to a primitive's `render` takes the name from that primitive.
const iconButtonSelectors = [
  {
    selector:
      "JSXElement[openingElement.name.name='Button']:has(JSXOpeningElement > JSXAttribute[name.name='size'][value.value=/^icon/]):not(:has(JSXOpeningElement > :matches(JSXAttribute[name.name=/^aria-label(ledby)?$/], JSXSpreadAttribute))):not(:has(Literal[value=/sr-only/])):not(JSXAttribute[name.name='render'] JSXElement)",
    message: 'An icon-only `Button` needs `aria-label` (or a `sr-only` label) naming its action (kosmos-style, Buttons).',
  },
];

// Sizes are spacing units, so the density setting (which sets `--spacing`) reaches every component.
const spacingPixelProps = 'size|h|w|min-h|max-h|min-w|max-w|p[xytblrse]?|m[xytblrse]?|gap|gap-x|gap-y|space-x|space-y|top|left|right|bottom|inset|inset-x|inset-y|start|end|basis';
const pixelSizeSelectors = classSelectors(
  `${classStart}-?(${spacingPixelProps})-\\[-?[0-9.]+px\\]`,
  'Size in spacing units (`h-7.5`, `py-1.25`), not arbitrary pixels, so the density setting reaches it (kosmos-style, Presets with a style).',
);

// Push protection reads these prefixes as real keys; demo keys start with `acme_`.
const keyLikePattern = '\\b((sk|pk|rk)_[A-Za-z0-9_]{6,}|whsec_|AKIA[0-9A-Z]{8,}|gh[pousr]_[A-Za-z0-9]{10,}|github_pat_|xox[abp]-)';
const keyLikeSelectors = classSelectors(
  keyLikePattern,
  'Demo keys start with `acme_` and never contain `sk_`, `pk_` or `whsec_`, which push protection reads as real keys (kosmos-style, demo-world.md, API).',
);

// A brand color from `--logo-color` reaches the mark only, so the name keeps its contrast.
const logoColorSelectors = classSelectors(
  `(^|[\\s"'\`])(?![^\\s"'\`]*\\[&_)[^\\s"'\`]*text-\\(--logo-color`,
  'A logo takes `--logo-color` on its mark only (`[&_:is(svg,img)]:text-(--logo-color)`); the name stays `text-foreground`, since a brand color can fall below 4.5:1 (kosmos-style, Status and tints).',
);

// A scale that runs through a transition must not run under reduced motion; the opacity fade carries the change.
const motionScaleSelectors = classSelectors(
  `^(?=[\\s\\S]*${classStart}transition-\\[[^\\]]*scale)(?=[\\s\\S]*(^|[\\s"'\`])(?![^\\s"'\`]*motion-safe:)[^\\s"'\`]*scale-[0-9\\[])`,
  'A `scale-*` in a class list that transitions `scale` takes `motion-safe:`, so reduced motion fades without scaling (kosmos-style, Reduced motion is mandatory).',
);

// A scale that starts a motion is one of the Kosmos values; `scale-x-*`, `scale-y-*` and `scale-(--var)` pass.
const motionScaleStartSelectors = classSelectors(
  `${classStart}motion-safe:([^\\s"'\`]*:)?scale-(?!(\\[0\\.97\\]|95|90|25|96|100)($|[\\s"'\`]|\\x2f))[0-9\\[]`,
  'Start a scale from `scale-[0.97]` (popover, menu), `scale-95` (dialog), `scale-90`, or `scale-25` with `blur-xs` (icon swap) (kosmos-style, Motion).',
);

// Reduced motion cross-fades; switching the transition off makes the change jump.
const motionReduceNoneSelectors = classSelectors(
  `${classStart}motion-reduce:transition-none${classEnd}`,
  'Under reduced motion, fade opacity (`motion-reduce:transition-[opacity]`) instead of `motion-reduce:transition-none`, so a change never jumps (kosmos-style, Reduced motion is mandatory).',
);

// A toast with an action must outlast the time a person needs to reach it (WCAG 2.2.1).
const toastActionMessage = 'A toast with an action sets `duration: Infinity` (Sonner) or `timeout: 0` (Base UI), so it cannot close before it can be used (kosmos-style, Reduced motion is mandatory; WCAG 2.2.1).';
const toastActionSelectors = [
  {
    selector:
      "CallExpression:matches([callee.name='toast'], [callee.object.name='toast'][callee.property.name!='add']) > ObjectExpression:has(Property[key.name='action']):not(:has(Property[key.name='duration'][value.name='Infinity']))",
    message: toastActionMessage,
  },
  {
    selector:
      "CallExpression[callee.object.name=/^toast/i][callee.property.name='add'] > ObjectExpression:has(Property[key.name='actionProps']):not(:has(Property[key.name='timeout'][value.value=0]))",
    message: toastActionMessage,
  },
];

// A live region exists before its text arrives; a screen reader announces changes to a region that already exists.
const liveRegionMessage =
  'A `role="status"` or `role="alert"` renders before its text does, and never behind a condition or with `empty:hidden`, since a screen reader announces changes to a region that already exists (kosmos-style, Names and announcements; WCAG 4.1.3).';
const liveRole = "JSXAttribute[name.name='role'][value.value=/^(status|alert)$/]";
const liveRegionSelectors = [
  {
    selector: `:matches(ConditionalExpression, LogicalExpression) > JSXElement > JSXOpeningElement:has(${liveRole})`,
    message: liveRegionMessage,
  },
  {
    selector: `JSXOpeningElement:has(${liveRole}):has(JSXAttribute[name.name='className'] :matches(Literal, TemplateElement)[value=/empty:hidden/])`,
    message: liveRegionMessage,
  },
];

// A tooltip trigger is reached by keyboard, so it renders a Button or a link, or takes `tabIndex`.
const tooltipTriggerSelectors = [
  {
    selector:
      "JSXOpeningElement[name.name='TooltipTrigger'] > JSXAttribute[name.name='render'] > JSXExpressionContainer > JSXElement > JSXOpeningElement[name.name!=/^(Button|button|a|Link|[A-Za-z]*Trigger)$/]:not(:has(JSXAttribute[name.name='tabIndex']))",
    message:
      'A `TooltipTrigger` renders a `Button` or a link, which a keyboard reaches; a `<time>` or `<span>` is mouse-only unless it takes `tabIndex` (kosmos-style, Names and announcements; WCAG 2.1.1).',
  },
];

// A number, amount or date never truncates: it takes `shrink-0`, and the text beside it takes `min-w-0`.
const truncatedNumberSelectors = classSelectors(
  `^(?=[\\s\\S]*${classStart}truncate${classEnd})(?=[\\s\\S]*${classStart}(tabular-nums|text-display)${classEnd})`,
  'A number, amount or date never truncates; it takes `shrink-0`, and the text beside it takes `min-w-0` (kosmos-style, Phones).',
);

// Truncated text stays readable in full. A string child goes in `title`; a slot whose full text lives in a tooltip or a
// detail view is listed here, with the reason.
const fullTextElsewhere = {
  'registry/kosmos/ui/breadcrumb.tsx': 'A tooltip shows a crumb in full while it is truncated.',
  'registry/kosmos/ui/select.tsx': 'The open list shows every option in full.',
  'registry/kosmos/ui/tool-call.tsx': 'Opening the call shows its title in full.',
  'registry/kosmos/ui/notification-inbox.tsx': 'The item opens its detail view, which shows the description in full.',
};
const truncateWithoutTitleSelectors = [
  {
    selector: `JSXOpeningElement:has(JSXAttribute[name.name='className'] :matches(Literal[value=/${classStart}(truncate|line-clamp-[0-9])${classEnd}/], TemplateElement[value.raw=/${classStart}(truncate|line-clamp-[0-9])${classEnd}/])):not(:has(JSXAttribute[name.name='title']))`,
    message:
      'Truncated text stays readable in full: give `truncate` or `line-clamp-*` a `title` (a string child), or list the file in `fullTextElsewhere` in the lint config with its reason (kosmos-style, Phones).',
  },
];

const orderSelectors = classSelectors(
  `${classStart}-?order-`,
  'Place an item with `col-start-*` and `row-start-*`, not `order-*`: the visual order must match the DOM order (kosmos-style, Phones).',
);

// A chart morphs to a new range; a `key` on the range remounts it and replays the entrance.
const chartRemountSelectors = [
  {
    selector:
      "JSXOpeningElement:matches([name.name=/Chart/], [name.property.name=/Chart/]) > JSXAttribute[name.name='key'] > JSXExpressionContainer > Identifier[name=/^range$/i]",
    message: "A chart morphs to a new range, it does not remount: no `key={range}` on a chart (kosmos-style, charts.md, Chart motion).",
  },
];

// A change in a stat is a triangle and a signed number, not a hue Badge, which marks a category.
const changeBadgeSelectors = [
  {
    selector:
      "JSXOpeningElement[name.name='Badge'] > JSXAttribute[name.name='variant'] > JSXExpressionContainer > ConditionalExpression:has(Literal[value='green']):has(Literal[value='red'])",
    message: 'A change is a green or red triangle with the signed number (`StatCardDelta`), not a hue Badge, which marks a category (kosmos-style, Status and tints).',
  },
];

// A status is a `StatusDot` with its word. A ringed dot is a marker (timeline node, presence on an avatar), not a status.
const statusDotMessage = 'A status is a `StatusDot` with its word (`done`, `pending`, `waiting`), not a hand-made dot (kosmos-style, Status and tints).';
const handMadeDotSelectors = classSelectors(
  `^(?=[\\s\\S]*${classStart}rounded-full${classEnd})(?=[\\s\\S]*${classStart}size-(1|1\\.5|2|2\\.5)${classEnd})(?=[\\s\\S]*${classStart}bg-(success|warning|muted-foreground)${classEnd})(?![\\s\\S]*${classStart}ring-)`,
  statusDotMessage,
);

// A control that does nothing is not rendered: it takes a real handler or `href`, or it does not show.
const deadHandlerSelectors = [
  {
    selector: "JSXAttribute[name.name='onClick'] > JSXExpressionContainer > ArrowFunctionExpression[body.type='BlockStatement'][body.body.length=0]",
    message: 'A control that does nothing is not rendered: render it only when its handler or `href` is passed (kosmos-style, Buttons).',
  },
];

// The server and the browser must format a number the same way.
const numberFieldLocaleSelectors = [
  {
    selector: "JSXOpeningElement[name.name='NumberField']:not(:has(JSXAttribute[name.name='locale']))",
    message: 'A `NumberField` sets `locale="en-US"`, so the server and the browser format the same number (kosmos-style, Buttons).',
  },
];

const codeRules = [
  ...overlayScrollSelectors,
  ...transitionSelectors,
  ...easeSelectors,
  ...textSizeSelectors,
  ...blurSelectors,
  ...pressSelectors,
  ...cnSelectors,
  ...styleSelectors,
  ...markColorSelectors,
  ...stickyTranslucentSelectors,
  ...iconButtonSelectors,
  ...buttonVariantsLinkSelectors,
  ...keyLikeSelectors,
  ...logoColorSelectors,
  ...motionScaleSelectors,
  ...motionScaleStartSelectors,
  ...motionReduceNoneSelectors,
  ...toastActionSelectors,
  ...liveRegionSelectors,
  ...tooltipTriggerSelectors,
];

const uiRules = [...codeRules, ...truncatedNumberSelectors];
const blockRules = [...uiRules, ...orderSelectors, ...chartRemountSelectors, ...changeBadgeSelectors, ...handMadeDotSelectors, ...deadHandlerSelectors, ...numberFieldLocaleSelectors];

// Registry code takes every color from the tokens and every duration from a token. The token files are the one place a
// color value is written.
const registryRules = [...kosmosSelectors, ...colorSelectors, ...durationSelectors];

// Components and blocks hold at phone width. Examples may fill the screen to show a scroll.
const phoneRules = [...viewportSelectors, ...pixelSizeSelectors];

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
      'no-restricted-syntax': ['error', ...kosmosSelectors, ...overlayScrollSelectors],
    },
  },
  {
    files: ['content/**/*.mdx/*.tsx'],
    rules: { 'no-restricted-syntax': ['error', ...kosmosSelectors, ...overlayScrollSelectors, ...keyLikeSelectors] },
  },
  {
    files: ['registry/**/*.{ts,tsx}'],
    ignores: ['registry/**/tokens.*', 'registry/kosmos/styles/**'],
    rules: { 'no-restricted-syntax': ['error', ...registryRules, ...codeRules] },
  },
  {
    files: ['registry/kosmos/ui/**/*.tsx'],
    ignores: Object.keys(fullTextElsewhere),
    rules: { 'no-restricted-syntax': ['error', ...registryRules, ...uiRules, ...phoneRules, ...truncateWithoutTitleSelectors] },
  },
  {
    files: Object.keys(fullTextElsewhere),
    rules: { 'no-restricted-syntax': ['error', ...registryRules, ...uiRules, ...phoneRules] },
  },
  {
    files: ['registry/kosmos/blocks/**/*.tsx'],
    rules: { 'no-restricted-syntax': ['error', ...registryRules, ...blockRules, ...phoneRules, ...truncateWithoutTitleSelectors, ...scrollSelectors] },
  },
  {
    files: ['registry/kosmos/examples/**/*.tsx'],
    rules: { 'no-restricted-syntax': ['error', ...registryRules, ...codeRules, ...handMadeDotSelectors, ...deadHandlerSelectors, ...numberFieldLocaleSelectors] },
  },
  {
    // The site keeps number durations for its docs demos, such as the slow run in the easing demo.
    files: ['components/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': ['error', ...kosmosSelectors, ...codeRules] },
  },
  {
    files: ['components/**/*.{ts,tsx}'],
    ignores: ['components/docs/use-docs-copy.ts'],
    rules: { 'no-restricted-syntax': ['error', ...kosmosSelectors, ...codeRules, ...copyHookSelectors] },
  },
  {
    files: ['components/site/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': ['error', ...kosmosSelectors, ...codeRules, ...copyHookSelectors, ...scrollSelectors] },
  },
  {
    files: ['components/docs/**/*.{ts,tsx}'],
    ignores: ['components/docs/use-docs-copy.ts', 'components/docs/code-block.tsx'],
    rules: { 'no-restricted-syntax': ['error', ...kosmosSelectors, ...codeRules, ...copyHookSelectors, ...scrollSelectors] },
  },
  {
    // The one file that wraps `clsx` and `tailwind-merge`.
    files: ['registry/kosmos/lib/cn.ts'],
    rules: { 'no-restricted-syntax': ['error', ...kosmosSelectors, ...colorSelectors, ...transitionSelectors, ...styleSelectors] },
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
