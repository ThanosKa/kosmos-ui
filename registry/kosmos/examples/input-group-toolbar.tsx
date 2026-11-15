import { Download, Search } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/registry/kosmos/ui/input-group';
import { Kbd } from '@/registry/kosmos/ui/kbd';

export default function InputGroupToolbar() {
  return (
    <div className="flex w-full max-w-md items-center gap-2">
      <InputGroup className="h-7.5">
        <InputGroupAddon align="inline-start">
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput type="search" aria-label="Filter projects" placeholder="Filter projects" />
        <InputGroupAddon align="inline-end">
          <Kbd>/</Kbd>
        </InputGroupAddon>
      </InputGroup>
      <Button variant="secondary">
        <Download data-icon="inline-start" aria-hidden />
        Export
      </Button>
    </div>
  );
}
