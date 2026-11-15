import { Check, Clock } from 'lucide-react';
import { Badge } from '@/registry/kosmos/ui/badge';

export default function BadgeIcon() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">
        <Check />
        Verified
      </Badge>
      <Badge variant="secondary">
        <Clock />
        2 days left
      </Badge>
    </div>
  );
}
