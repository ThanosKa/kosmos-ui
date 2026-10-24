'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { appName } from '@/lib/shared';
import { currentLinkHref, siteLinks } from '@/lib/site-links';
import { Navbar, type NavbarProps } from '@/registry/kosmos/blocks/navbar/navbar';
import { KosmosMark } from './kosmos-mark';

/** The Navbar block with the site's name, logo and links, marking the link that holds the page being shown. */
export function SiteNavbar(props: Pick<NavbarProps, 'id' | 'className' | 'actions' | 'menu' | 'fullWidth'>) {
  const pathname = usePathname();
  return (
    <Navbar
      name={appName}
      logo={<KosmosMark className="size-5" />}
      items={[...siteLinks]}
      current={currentLinkHref(siteLinks, pathname)}
      navLabel="Site"
      sheetActions={null}
      linkComponent={Link}
      {...props}
    />
  );
}
