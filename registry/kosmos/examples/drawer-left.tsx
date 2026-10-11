import { Menu } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/registry/kosmos/ui/drawer';

const pages = ['Overview', 'Projects', 'Tasks', 'Reports', 'Settings'];

export default function DrawerLeft() {
  return (
    <Drawer swipeDirection="left">
      <DrawerTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation" />}>
        <Menu />
      </DrawerTrigger>
      <DrawerContent className="sm:data-[swipe-direction=left]:max-w-72">
        <DrawerHeader>
          <DrawerTitle>Acme</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <nav aria-label="Main" className="flex flex-col gap-0.5">
            {pages.map((page) => (
              <Button key={page} variant="ghost" href="#" className="justify-start">
                {page}
              </Button>
            ))}
          </nav>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
