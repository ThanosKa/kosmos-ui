import { Button } from '@/registry/kosmos/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/registry/kosmos/ui/drawer';

export default function DrawerNonModal() {
  return (
    <Drawer modal={false} disablePointerDismissal>
      <DrawerTrigger render={<Button variant="secondary" />}>Show comments</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Comments</DrawerTitle>
          <DrawerDescription>The page stays usable while this panel is open.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-muted-foreground">No comments yet. Select text on the page to start a thread.</p>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
