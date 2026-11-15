import { Badge } from '@/registry/kosmos/ui/badge';

export default function BadgeTags() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="blue">Enterprise</Badge>
      <Badge variant="green">Expansion</Badge>
      <Badge variant="violet">Pilot</Badge>
      <Badge variant="gray">Upsell</Badge>
      <Badge variant="amber">Small business</Badge>
      <Badge variant="red">Blocked</Badge>
    </div>
  );
}
