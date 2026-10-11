import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/registry/kosmos/ui/badge';

export default function BadgeLink() {
  return (
    <Badge variant="secondary" render={<a href="https://base-ui.com/react/overview/releases" />}>
      Base UI releases
      <ArrowUpRight />
    </Badge>
  );
}
