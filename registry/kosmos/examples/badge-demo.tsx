import { Badge } from '@/registry/kosmos/ui/badge';

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="destructive">Failed</Badge>
      <Badge variant="primary">New</Badge>
    </div>
  );
}
