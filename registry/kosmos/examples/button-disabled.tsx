import { Button } from '@/registry/kosmos/ui/button';

export default function ButtonDisabled() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" disabled>
        Save changes
      </Button>
      <Button variant="secondary" disabled focusableWhenDisabled>
        Export
      </Button>
    </div>
  );
}
