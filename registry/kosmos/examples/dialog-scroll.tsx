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

const projects = [
  { name: 'Fernhill Books', domain: 'fernhill.example' },
  { name: 'Brightloop Fitness', domain: 'brightloop.example' },
  { name: 'Copperline Bank', domain: 'copperline.example' },
  { name: 'Saltmarsh Coffee', domain: 'saltmarsh.example' },
  { name: 'Driftwood Travel', domain: 'driftwood.example' },
  { name: 'Hollow Oak Games', domain: 'hollowoak.example' },
  { name: 'Cirrus Weather', domain: 'cirrus.example' },
  { name: 'Pebble & Pine', domain: 'pebblepine.example' },
  { name: 'Marigold Recipes', domain: 'marigold.example' },
  { name: 'Kiln Studio', domain: 'kiln.example' },
  { name: 'Tidepool Notes', domain: 'tidepool.example' },
  { name: 'Ironbark Logistics', domain: 'ironbark.example' },
];

export default function DialogScroll() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>View projects</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Projects</DialogTitle>
          <DialogDescription>{projects.length} projects send events to Acme.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <ul className="flex flex-col divide-y divide-border">
            {projects.map((project) => (
              <li key={project.name} className="flex flex-col py-2">
                <span>{project.name}</span>
                <span className="text-small text-muted-foreground">{project.domain}</span>
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
