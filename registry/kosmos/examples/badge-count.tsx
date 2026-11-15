import { Badge } from '@/registry/kosmos/ui/badge';

export default function BadgeCount() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="primary">3</Badge>
      <Badge variant="secondary">12</Badge>
      <Badge variant="secondary">1,280</Badge>
    </div>
  );
}
