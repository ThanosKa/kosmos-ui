import { Mail, Rss } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };
/** A link shown as an icon button; `label` is its accessible name. */
type FooterSocialLink = FooterLink & { icon: React.ReactNode };

// Sample data: replace it with your product's name, pages and profiles.
const sampleName = 'Parallax';
const sampleDescription = 'Product analytics for the teams that run sites and apps.';
const sampleColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'SDKs', href: '/docs/sdks' },
      { label: 'API reference', href: '/docs/api' },
      { label: 'Status', href: 'https://status.parallax.example' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Security', href: '/security' },
    ],
  },
];
const sampleSocial: FooterSocialLink[] = [
  { label: 'Parallax blog feed', href: '/blog/rss.xml', icon: <Rss aria-hidden /> },
  { label: 'Email Parallax', href: 'mailto:hello@parallax.example', icon: <Mail aria-hidden /> },
];
const sampleLegal = '© 2026 Parallax';

const linkClass =
  'rounded-sm text-small text-muted-foreground transition-[color] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** The first letter of the product in a filled tile, until there is a logo. */
function FooterMark({ name }: { name: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="flex size-7 items-center justify-center rounded-lg border border-transparent bg-primary text-body font-semibold text-primary-foreground shadow-primary"
    >
      {typeof name === 'string' ? name.trim().charAt(0).toUpperCase() : null}
    </span>
  );
}

type FooterProps = React.ComponentProps<'footer'> & {
  /** The product name beside the logo, linking to `homeHref`. */
  name?: React.ReactNode;
  /** Replaces the letter tile beside the name, usually with your logo. Decorative: the name names the link. */
  logo?: React.ReactNode;
  /** One line under the name. `null` leaves it out. */
  description?: React.ReactNode;
  /** Where the name links. */
  homeHref?: string;
  /** Columns of links, each under its title. */
  columns?: FooterColumn[];
  /** Icon links at the end of the bottom row, such as your profiles. */
  social?: FooterSocialLink[];
  /** The start of the bottom row: a copyright, a byline. `null` leaves it out. */
  legal?: React.ReactNode;
  /** Renders the name and column links, such as your router's `Link`. Defaults to `<a>`. */
  linkComponent?: React.ElementType<React.ComponentProps<'a'> & { href: string }>;
};

/**
 * The bottom of a marketing page: the product with one line, columns of links and a row with the copyright and icon
 * links. Lays itself out by its own width: columns go from two to four from 576px, and sit beside the product from 896px.
 */
function Footer({
  name = sampleName,
  logo,
  description = sampleDescription,
  homeHref = '/',
  columns = sampleColumns,
  social = sampleSocial,
  legal = sampleLegal,
  linkComponent: Link = 'a',
  className,
  ...props
}: FooterProps) {
  return (
    <footer data-slot="footer" className={cn('@container border-t border-border', className)} {...props}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 @2xl:px-6 @4xl:flex-row @4xl:justify-between @4xl:gap-16">
        <div className="flex max-w-xs flex-col items-start gap-3">
          <Link
            href={homeHref}
            className="flex items-center gap-2 rounded-lg text-title text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {logo ?? <FooterMark name={name} />}
            {name}
          </Link>
          {description ? <p className="text-small text-pretty text-muted-foreground">{description}</p> : null}
        </div>
        {columns.length > 0 ? (
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 @xl:grid-cols-4 @4xl:min-w-xl">
            {columns.map((column) => (
              <div key={column.title} className="flex min-w-0 flex-col gap-3">
                <h2 className="text-small font-medium text-foreground">{column.title}</h2>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href} className="min-w-0">
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        ) : null}
      </div>
      {legal || social.length > 0 ? (
        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-7xl flex-col-reverse items-start gap-3 px-4 py-4 @md:flex-row @md:items-center @md:justify-between @2xl:px-6">
            {legal ? <div className="text-small text-pretty text-muted-foreground">{legal}</div> : <span />}
            {social.length > 0 ? (
              <ul className="-ms-1.5 flex flex-wrap items-center gap-1 @md:-me-1.5 @md:ms-0">
                {social.map((link) => (
                  <li key={link.href}>
                    <Button variant="ghost" size="icon" href={link.href} aria-label={link.label}>
                      {link.icon}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </footer>
  );
}

export { Footer, type FooterColumn, type FooterLink, type FooterProps, type FooterSocialLink };
