import Link from 'next/link';
import type { ReactNode } from 'react';
import { getChangelogEntries } from '@/lib/changelog';
import { formatStars, getRepoStats, minStarsShown } from '@/lib/github';
import { docsRoute, githubUrl, licenseUrl } from '@/lib/shared';
import { Button } from '@/registry/kosmos/ui/button';
import { GitHubIcon } from './brand-icons';

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

const inlineLink =
  'rounded-sm font-medium text-foreground underline decoration-muted-foreground underline-offset-4 transition-[text-decoration-color] hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

function ProofTile({ label, value, children }: { label: string; value: ReactNode; children: ReactNode }) {
  return (
    <li className="flex min-w-0 flex-col gap-2 rounded-2xl border border-transparent bg-card p-5 shadow-card">
      <span className="text-small text-muted-foreground">{label}</span>
      <span className="text-display text-foreground tabular-nums">{value}</span>
      <div className="mt-auto flex flex-col items-start gap-3 pt-1 text-small text-pretty text-muted-foreground">{children}</div>
    </li>
  );
}

export const landingProofHeadingId = 'landing-proof-heading';

/**
 * What shows the project is alive, from real data only: the GitHub stars and last push, and the changelog. When
 * GitHub can't be reached the stars give way to a link and the date to the newest changelog entry.
 */
export async function LandingProof() {
  const repo = await getRepoStats();
  const entries = getChangelogEntries();
  const latest = entries[0];
  const showStars = repo !== null && repo.stars >= minStarsShown;
  const lastUpdate = repo ? { iso: repo.pushedAt, source: 'Last push to GitHub' } : latest ? { iso: latest.isoDate, source: 'Newest changelog entry' } : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 id={landingProofHeadingId} className="text-display font-semibold text-balance text-foreground">
          Built in the open
        </h2>
        <p className="max-w-[34em] text-lead text-pretty text-muted-foreground">Every change is public on GitHub and written up in the changelog.</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProofTile label={showStars ? 'GitHub stars' : 'GitHub'} value={showStars ? <span data-stars>{formatStars(repo.stars)}</span> : 'Public'}>
          <p>{showStars ? 'Star the repo to follow new blocks as they land.' : 'Read the code, open an issue or send a pull request.'}</p>
          <Button variant="secondary" href={githubUrl}>
            <GitHubIcon data-icon="inline-start" />
            {showStars ? 'Star on GitHub' : 'View on GitHub'}
          </Button>
        </ProofTile>
        {lastUpdate ? (
          <ProofTile label="Last update" value={<time dateTime={lastUpdate.iso}>{shortDate.format(new Date(lastUpdate.iso))}</time>}>
            <p>{lastUpdate.source}</p>
          </ProofTile>
        ) : null}
        {latest ? (
          <ProofTile label="Changelog entries" value={entries.length}>
            <p>
              Newest:{' '}
              <Link href={latest.page.url} className={inlineLink}>
                {latest.page.data.title}
              </Link>
            </p>
            <p>
              <Link href={`${docsRoute}/changelog`} className={inlineLink}>
                Read every entry
              </Link>
            </p>
          </ProofTile>
        ) : null}
        <ProofTile label="License" value="MIT">
          <p>
            Free for personal and commercial projects.{' '}
            <a href={licenseUrl} className={inlineLink}>
              Read the license
            </a>
          </p>
        </ProofTile>
      </ul>
    </div>
  );
}
