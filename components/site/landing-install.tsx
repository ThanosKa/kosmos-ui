import { ArrowUpRight } from 'lucide-react';
import { addCommands, installedPath, readRegistryItems, resolveRegistryTree } from '@/lib/registry';
import { docsRoute } from '@/lib/shared';
import { InstallTerminal } from './install-terminal';

/** The block the terminal installs: one that brings several components with it. */
const shownBlock = 'data-table';

const agentDocs = [
  { name: 'llms.txt', href: '/llms.txt', description: 'An index of every docs page, for an agent to pick from.' },
  { name: 'llms-full.txt', href: '/llms-full.txt', description: 'Every docs page in one file, to load whole.' },
  {
    name: 'Markdown pages',
    href: `${docsRoute}/components/button.md`,
    description: 'Add .md to any docs URL, or ask for text/markdown, and the page comes back as Markdown.',
  },
];

const rowLink =
  'group/row flex items-start justify-between gap-4 rounded-lg px-3 py-3 transition-[background-color] hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

export const landingInstallHeadingId = 'landing-install-heading';

/** One `shadcn add` with the files it writes, and the plain-text docs agents read. */
export function LandingInstall() {
  const items = readRegistryItems();
  const files = resolveRegistryTree(shownBlock, items).flatMap((item) => (item.files ?? []).filter((file) => file.type !== 'registry:theme').map(installedPath));
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 id={landingInstallHeadingId} className="text-display font-semibold text-balance text-foreground">
            One command, and your agent reads the docs too
          </h2>
          <p className="max-w-[34em] text-lead text-pretty text-muted-foreground">
            The shadcn CLI copies a block and every component it needs into your project, as code you own. Agents get each page as plain text.
          </p>
        </div>
        <ul className="-mx-3 flex flex-col">
          {agentDocs.map((doc) => (
            <li key={doc.href}>
              <a href={doc.href} className={rowLink}>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-mono text-body font-medium text-foreground">{doc.name}</span>
                  <span className="text-small text-pretty text-muted-foreground">{doc.description}</span>
                </span>
                <ArrowUpRight aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-[color] group-hover/row:text-foreground" />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <InstallTerminal commands={addCommands(shownBlock)} files={files} />
    </div>
  );
}
