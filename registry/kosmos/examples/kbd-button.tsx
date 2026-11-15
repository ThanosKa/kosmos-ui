import { Search } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';

export default function KbdButton() {
  return (
    <Button variant="secondary" className="w-56 justify-between ps-2.5 pe-1.5 font-normal text-muted-foreground">
      <span className="flex items-center gap-2">
        <Search aria-hidden />
        Search
      </span>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </Button>
  );
}
