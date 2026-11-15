import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';

export default function ButtonWithIcon() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">
        <Plus data-icon="inline-start" />
        New project
      </Button>
      <Button variant="secondary">
        Continue
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  );
}
