import { Bell, Settings } from 'lucide-react';
import { Button } from '@/registry/kosmos/ui/button';

export default function ButtonIcon() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" size="icon" aria-label="Settings">
        <Settings />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell />
      </Button>
    </div>
  );
}
