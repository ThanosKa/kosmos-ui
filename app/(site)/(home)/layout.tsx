import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { buttonVariants } from '@/registry/kosmos/ui/button';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <a
        href="#content"
        className={`${buttonVariants({ variant: 'secondary' })} fixed start-4 top-3 z-50 -translate-y-16 focus-visible:translate-y-0`}
      >
        Skip to content
      </a>
      <SiteHeader />
      <div id="content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
