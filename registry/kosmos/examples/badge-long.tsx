import { Badge } from '@/registry/kosmos/ui/badge';

export default function BadgeLong() {
  return (
    <div className="flex w-40 flex-col items-start gap-2">
      <Badge variant="warning">
        <span className="min-w-0 truncate">Waiting for approval from the finance team</span>
      </Badge>
    </div>
  );
}
