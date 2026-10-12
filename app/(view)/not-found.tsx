import { RootProvider } from 'fumadocs-ui/provider/next';
import { SearchX } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';

/** An unknown `/view/<name>` or `/approve/<group>`, inside the preview layout in the stored theme. */
export default function ViewNotFound() {
  return (
    <RootProvider search={{ enabled: false }} theme={{ hotKey: false }}>
      <main className="flex min-h-dvh items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle render={<h1 />}>No preview by that name</EmptyTitle>
            <EmptyDescription>Check the name in the address, or find the component in the gallery.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="secondary" href="/gallery">
              Open the gallery
            </Button>
          </EmptyContent>
        </Empty>
      </main>
    </RootProvider>
  );
}
