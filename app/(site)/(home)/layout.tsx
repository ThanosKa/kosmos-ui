import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
