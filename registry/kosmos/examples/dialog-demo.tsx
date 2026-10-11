import { Button } from '@/registry/kosmos/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/registry/kosmos/ui/dialog';

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>Invite member</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to workspace</DialogTitle>
          <DialogDescription>New members can see every project in Acme.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p>We&apos;ll email an invite to ana@acme.com. It expires in 7 days.</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
          <DialogClose render={<Button variant="primary" />}>Send invite</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
