import { Bold, Italic, Link, List } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import { Separator } from '@/registry/kosmos/ui/separator';

export default function SeparatorVertical() {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" aria-label="Bold">
        <Bold />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Italic">
        <Italic />
      </Button>
      <Separator orientation="vertical" className="mx-1 my-1.5" />
      <Button variant="ghost" size="icon" aria-label="Bulleted list">
        <List />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Insert link">
        <Link />
      </Button>
    </div>
  );
}
