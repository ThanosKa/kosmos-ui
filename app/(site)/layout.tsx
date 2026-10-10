import { RootProvider } from 'fumadocs-ui/provider/next';
import '../global.css';
import { htmlFontClassName } from '@/lib/fonts';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={htmlFontClassName} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
