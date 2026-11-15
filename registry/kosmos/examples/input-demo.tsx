import { Input } from '@/registry/kosmos/ui/input';

export default function InputDemo() {
  return (
    <Input
      type="email"
      name="email"
      autoComplete="email"
      aria-label="Email"
      placeholder="name@company.com"
      className="max-w-xs"
    />
  );
}
