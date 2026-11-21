import { Button } from '@/registry/kosmos/ui/button';
import { Separator } from '@/registry/kosmos/ui/separator';

export default function SeparatorLabel() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Button variant="secondary" size="lg" className="w-full">
        Continue with single sign-on
      </Button>
      <Separator>or</Separator>
      <Button variant="primary" size="lg" className="w-full">
        Continue with email
      </Button>
    </div>
  );
}
