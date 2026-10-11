import { Button } from '@/registry/kosmos/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/registry/kosmos/ui/dialog';

export default function DialogConfirm() {
  return (
    <Dialog disablePointerDismissal>
      <DialogTrigger render={<Button variant="destructive" />}>Delete project</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete Q3 Roadmap?</DialogTitle>
          <DialogDescription>The project and its 24 tasks will be deleted. You can&apos;t undo this.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
          <DialogClose render={<Button variant="destructive" />}>Delete project</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
