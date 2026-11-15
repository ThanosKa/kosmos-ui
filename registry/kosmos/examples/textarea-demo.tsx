import { Textarea } from '@/registry/kosmos/ui/textarea';

export default function TextareaDemo() {
  return <Textarea name="note" aria-label="Note" placeholder="Add a note for the team" className="max-w-sm" />;
}
