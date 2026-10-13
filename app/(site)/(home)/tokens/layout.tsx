import { SiteFooter } from '@/components/site/site-footer';

/** The landing closes with the footer as one of its labelled sections, so the pages beside it add the footer here. */
export default function Layout({ children }: LayoutProps<'/tokens'>) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
