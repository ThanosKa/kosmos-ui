import type { ReactNode } from 'react';
import { author } from '@/lib/shared';
import { Button } from '@/registry/kosmos/ui/button';
import { XIcon } from './brand-icons';
import { GitHubLink } from './github-link';
import { SearchButton } from './search-button';
import { SiteNavbar } from './site-navbar';
import { SitePresetMenu } from './site-preset-menu';
import { ThemeToggle } from './theme-toggle';

type SiteHeaderProps = {
  /** Replaces the button that opens the sheet of site links below 768px. */
  menu?: ReactNode;
};

/**
 * The site header on the landing page and the docs, built from the Navbar block: logo, site links, search, GitHub, X,
 * the site's preset and the theme toggle. Full width on every page, so it stays put between the landing page and the
 * docs, and the logo lines up with the docked docs sidebar.
 */
export function SiteHeader({ menu }: SiteHeaderProps) {
  return (
    <SiteNavbar
      id="site-header"
      menu={menu}
      fullWidth
      actions={
        <>
          <SearchButton />
          <GitHubLink />
          <Button variant="secondary" size="icon" href={author.xUrl} aria-label={`${author.name} on X`}>
            <XIcon className="size-3.5" />
          </Button>
          <SitePresetMenu />
          <ThemeToggle />
        </>
      }
    />
  );
}
