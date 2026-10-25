import { Search } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/registry/kosmos/ui/input-group';
import { Kbd } from '@/registry/kosmos/ui/kbd';

export default function InputGroupDemo() {
  return (
    <InputGroup className="max-w-xs">
      <InputGroupAddon align="inline-start">
        <Search aria-hidden />
      </InputGroupAddon>
      <InputGroupInput type="search" aria-label="Search projects" placeholder="Search projects" />
      <InputGroupAddon align="inline-end">
        <Kbd>/</Kbd>
      </InputGroupAddon>
    </InputGroup>
  );
}
