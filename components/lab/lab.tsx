'use client';

import { candidates } from '@/components/lab/candidates';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Toaster } from '@/registry/kosmos/ui/toast';
import { TooltipProvider } from '@/registry/kosmos/ui/tooltip';

/**
 * The lab: each candidate in its own section with its states, so the maintainer can keep or drop it.
 * `only` renders one candidate, for `/lab/<slug>`.
 */
export function Lab({ only }: { only?: string }) {
  const shown = only ? candidates.filter((candidate) => candidate.slug === only) : candidates;
  return (
    <TooltipProvider>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-8 sm:px-6 sm:py-10">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-caption tracking-[0.05em] text-muted-foreground uppercase">Kosmos UI</p>
            <h1 className="text-heading">Lab</h1>
            <p className="max-w-[40em] text-small text-pretty text-muted-foreground">
              Candidates built in the Kosmos style but not yet in the registry. Keep the ones worth the full build
              cycle.
            </p>
          </div>
          <ThemeToggle />
        </header>

        {only ? null : candidates.length === 0 ? (
          <p className="text-small text-muted-foreground">No candidates yet.</p>
        ) : (
          <nav aria-label="Candidates" className="flex flex-wrap gap-2">
            {candidates.map((candidate) => (
              <Badge key={candidate.slug} render={<a href={`#${candidate.slug}`} />}>
                {candidate.title}
              </Badge>
            ))}
          </nav>
        )}

        <div className="flex flex-col divide-y divide-border">
          {shown.map(({ slug, title, kind, why, Preview }) => (
            <section
              key={slug}
              id={slug}
              aria-labelledby={`${slug}-title`}
              className="flex scroll-mt-8 flex-col gap-4 py-12 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h2 id={`${slug}-title`} className="text-title">
                    {title}
                  </h2>
                  <Badge variant={kind === 'block' ? 'blue' : 'violet'}>{kind}</Badge>
                </div>
                <p className="max-w-[48em] text-small text-pretty text-muted-foreground">{why}</p>
              </div>
              <div className="min-w-0">
                <Preview />
              </div>
            </section>
          ))}
        </div>
      </main>
      <Toaster />
    </TooltipProvider>
  );
}
