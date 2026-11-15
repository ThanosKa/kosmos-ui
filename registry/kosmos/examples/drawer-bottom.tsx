import { Button } from '@/registry/kosmos/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/registry/kosmos/ui/drawer';

export default function DrawerBottom() {
  return (
    <Drawer swipeDirection="down">
      <DrawerTrigger render={<Button variant="secondary" />}>Share</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Share Q3 Roadmap</DrawerTitle>
          <DrawerDescription>Anyone with the link can view.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose render={<Button variant="secondary" />}>Cancel</DrawerClose>
          <DrawerClose render={<Button variant="primary" />}>Copy link</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
