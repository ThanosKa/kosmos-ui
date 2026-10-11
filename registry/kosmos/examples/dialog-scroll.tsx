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

const members = [
  'Ana Lopez',
  'Ben Carter',
  'Chen Wei',
  'Dara Okafor',
  'Elif Demir',
  'Farah Haddad',
  'Goran Petrovic',
  'Hana Sato',
  'Ivan Novak',
  'Jonas Berg',
  'Kira Ivanova',
  'Liam Walsh',
  'Maya Cohen',
  'Nils Larsen',
  'Omar Aziz',
  'Paula Reyes',
];

export default function DialogScroll() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>View members</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Members</DialogTitle>
          <DialogDescription>{members.length} people have access to Q3 Roadmap.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <ul className="flex flex-col divide-y divide-border">
            {members.map((name) => (
              <li key={name} className="py-2">
                {name}
              </li>
            ))}
          </ul>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="primary" />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
