import Link from 'next/link';
import { appName, author, docsRoute, githubUrl, licenseUrl } from '@/lib/shared';
import { Footer, type FooterColumn } from '@/registry/kosmos/blocks/footer/footer';
import { GitHubIcon, LinkedInIcon, XIcon } from './brand-icons';
import { KosmosMark } from './kosmos-mark';

const columns: FooterColumn[] = [
  {
    title: 'Docs',
    links: [
      { label: 'Introduction', href: docsRoute },
      { label: 'Installation', href: `${docsRoute}/installation` },
      { label: 'Changelog', href: `${docsRoute}/changelog` },
    ],
  },
  {
    title: 'Library',
    links: [
      { label: 'Components', href: `${docsRoute}/components` },
      { label: 'Blocks', href: `${docsRoute}/blocks` },
      { label: 'Foundations', href: `${docsRoute}/foundations/color` },
    ],
  },
  {
    title: 'For agents',
    links: [
      { label: 'llms.txt', href: '/llms.txt' },
      { label: 'llms-full.txt', href: '/llms-full.txt' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'GitHub', href: githubUrl },
      { label: 'MIT License', href: licenseUrl },
    ],
  },
];

const byline = 'rounded-sm font-medium text-foreground underline decoration-muted-foreground underline-offset-4 transition-[text-decoration-color] hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** The site's footer, built from the Footer block: where the docs, the code and its author live. */
export function SiteFooter() {
  return (
    <Footer
      name={appName}
      logo={<KosmosMark className="size-5" />}
      description="Components and blocks for dashboard apps. Free and open source under MIT."
      columns={columns}
      social={[
        { label: `${author.name} on X`, href: author.xUrl, icon: <XIcon /> },
        { label: `${author.name} on LinkedIn`, href: author.linkedinUrl, icon: <LinkedInIcon /> },
        { label: `${author.name} on GitHub`, href: author.githubUrl, icon: <GitHubIcon /> },
      ]}
      legal={
        <p>
          Built by{' '}
          <a href={author.xUrl} className={byline}>
            {author.name}
          </a>
        </p>
      }
      linkComponent={Link}
    />
  );
}
