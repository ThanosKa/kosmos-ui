import { Button } from '@/registry/kosmos/ui/button';
import { Input } from '@/registry/kosmos/ui/input';

export default function InputWithButton() {
  return (
    <form className="flex w-full max-w-sm gap-2">
      <Input type="email" name="invite" aria-label="Email to invite" placeholder="name@company.com" />
      <Button variant="secondary" type="submit">
        Invite
      </Button>
    </form>
  );
}
