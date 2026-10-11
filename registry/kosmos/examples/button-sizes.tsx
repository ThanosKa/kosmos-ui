import { Button } from '@/registry/kosmos/ui/button';

export default function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" size="sm">
        Small
      </Button>
      <Button variant="secondary" size="md">
        Medium
      </Button>
      <Button variant="secondary" size="lg">
        Large
      </Button>
    </div>
  );
}
