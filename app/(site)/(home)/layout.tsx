import { SiteHeader } from '@/components/site/site-header';
import { SkipLink } from '@/components/site/skip-link';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <div id="content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </div>
    </>
  );
}
