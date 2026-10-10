import { Button } from '@/registry/kosmos/ui/button';

export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save changes</Button>
    </div>
  );
}
