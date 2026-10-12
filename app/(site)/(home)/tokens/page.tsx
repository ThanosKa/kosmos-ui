import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { readKosmosTokens } from '@/lib/tokens';
import { ease, duration } from '@/registry/kosmos/lib/motion';
import { EasingDemo } from '@/components/docs/easing-demo';

export const metadata: Metadata = {
  title: 'Tokens',
  description: 'Every Kosmos UI token in light and dark.',
  // An internal review page, like the (view) routes: keep it out of search results.
  robots: { index: false },
};

const motionEase: Record<string, readonly number[]> = {
  'power3-out': ease.power3Out,
  'smooth-in-out': ease.smoothInOut,
};

function parseBezier(value: string) {
  return (/cubic-bezier\(([^)]+)\)/.exec(value)?.[1] ?? '')
    .split(',')
    .map((part) => Number(part.trim()));
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-title">{title}</h2>
        <p className="max-w-[40em] text-small text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

export default function TokensPage() {
  const tokens = readKosmosTokens();

  const colors = Object.keys(tokens.light).filter(
    (name) => `color-${name}` in tokens.themeInline,
  );
  const shadows = Object.keys(tokens.light).filter((name) =>
    name.startsWith('shadow-'),
  );
  const radii = Object.keys(tokens.themeInline).filter((name) =>
    name.startsWith('radius-'),
  );
  const easings = Object.entries(tokens.theme)
    .filter(([name]) => name.startsWith('ease-'))
    .map(([name, value]) => ({
      name: name.replace('ease-', ''),
      bezier: parseBezier(value),
    }));
  const durations = Object.entries(tokens.theme).filter(([name]) =>
    name.startsWith('transition-duration-'),
  );
  const typeRoles = Object.keys(tokens.theme)
    .filter((name) => name.startsWith('text-') && !name.includes('--'))
    .map((name) => name.replace('text-', ''));

  const motionMismatches = [
    ...easings
      .filter(
        ({ name, bezier }) =>
          motionEase[name]?.join() !== bezier.join(),
      )
      .map(({ name }) => `ease-${name}`),
    ...durations
      .filter(([name, value]) => {
        const key = name.replace('transition-duration-', '');
        const seconds = duration[key as keyof typeof duration];
        return seconds === undefined || `${Math.round(seconds * 1000)}ms` !== value;
      })
      .map(([name]) => name),
  ];

  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-12 px-4 py-12 md:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading">Tokens</h1>
        <p className="max-w-[40em] text-body text-muted-foreground">
          Every value read straight from{' '}
          <code className="font-mono text-small">
            registry/kosmos/styles/tokens.css
          </code>
          . Switch the theme in the header to compare light and dark.
        </p>
      </header>

      <Section
        title="Colors"
        description="Semantic, shadcn-compatible names. Components use these through Tailwind (bg-primary, text-muted-foreground), never raw values."
      >
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colors.map((name) => (
            <li
              key={name}
              data-token-swatch={name}
              className="flex items-center gap-3 rounded-xl border border-transparent bg-card p-2 shadow-card"
            >
              <span
                style={{ background: `var(--${name})` }}
                className="size-10 shrink-0 rounded-lg shadow-inset"
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <code className="truncate text-body font-medium">{name}</code>
                <span className="truncate font-mono text-caption text-muted-foreground">
                  <span className="dark:hidden">{tokens.light[name]}</span>
                  <span className="hidden dark:inline">
                    {tokens.dark[name] ?? tokens.light[name]}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Shadows"
        description="Layered shadows replace borders on surfaces. In dark mode each one carries a dark outer ring and a 1px inner rim of light."
      >
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {shadows.map((name) => (
            <li
              key={name}
              data-token-shadow={name}
              className="flex flex-col gap-3"
            >
              <span
                style={{ boxShadow: `var(--${name})` }}
                className={`h-20 rounded-xl border border-transparent ${
                  name === 'shadow-primary'
                    ? 'bg-primary'
                    : name === 'shadow-inset'
                      ? 'bg-muted'
                      : 'bg-card'
                }`}
              />
              <code className="text-body font-medium">{name}</code>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Easing"
        description="Power curves, shared by Tailwind (ease-power3-out) and Motion (ease.power3Out). power3-out is the default for every transition."
      >
        <EasingDemo items={easings} />
        <p
          data-motion-parity={motionMismatches.length === 0 ? 'match' : 'mismatch'}
          className="text-small text-muted-foreground"
        >
          {motionMismatches.length === 0
            ? 'Motion values in registry/kosmos/lib/motion.ts match the CSS.'
            : `Motion values differ from the CSS: ${motionMismatches.join(', ')}`}
        </p>
      </Section>

      <Section
        title="Duration"
        description="Named durations for Tailwind (duration-fast) and Motion (duration.fast, in seconds)."
      >
        <ul className="flex flex-col gap-2">
          {durations.map(([name, value]) => (
            <li
              key={name}
              data-token-duration={name}
              className="grid grid-cols-[160px_64px_1fr] items-center gap-4"
            >
              <code className="text-body font-medium">
                {name.replace('transition-', '')}
              </code>
              <span className="text-small tabular-nums text-muted-foreground">
                {value}
              </span>
              <span
                style={{ width: `calc(${value.replace('ms', '')} / 300 * 100%)` }}
                className="h-2 rounded-full bg-primary"
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Type scale"
        description="Dense UI text, 12 to 14px in components. Numbers that change take tabular-nums."
      >
        <ul className="flex flex-col gap-4">
          {typeRoles.map((role) => (
            <li
              key={role}
              data-token-type={role}
              className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr] sm:items-baseline sm:gap-4"
            >
              <div className="flex flex-col">
                <code className="text-body font-medium">text-{role}</code>
                <span className="font-mono text-caption tabular-nums text-muted-foreground">
                  {tokens.theme[`text-${role}`]} /{' '}
                  {tokens.theme[`text-${role}--line-height`]}
                  {tokens.theme[`text-${role}--font-weight`]
                    ? ` / ${tokens.theme[`text-${role}--font-weight`]}`
                    : ''}
                </span>
              </div>
              <p
                style={{
                  fontSize: `var(--text-${role})`,
                  lineHeight: `var(--text-${role}--line-height)`,
                  fontWeight: `var(--text-${role}--font-weight, 400)`,
                  letterSpacing: `var(--text-${role}--letter-spacing, 0)`,
                }}
                className="truncate tabular-nums"
              >
                Revenue grew 12.4% to $48,210 in Q3
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Radius"
        description="Controls take rounded-lg, overlays rounded-xl, cards rounded-2xl, sheet tops rounded-3xl, tags and badges rounded-full."
      >
        <ul className="flex flex-wrap gap-6">
          {radii.map((name) => (
            <li key={name} className="flex flex-col items-center gap-2">
              <span
                style={{ borderRadius: tokens.themeInline[name] }}
                className="size-16 border border-transparent bg-card shadow-card"
              />
              <code className="text-small">{name.replace('radius-', 'rounded-')}</code>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
