import { Separator } from '@/registry/kosmos/ui/separator';

export default function SeparatorCard() {
  return (
    <div className="flex w-full max-w-xs flex-col rounded-2xl border border-transparent bg-card shadow-card">
      <div className="flex flex-col gap-0.5 p-4">
        <span className="text-title">Billing</span>
        <span className="text-small text-muted-foreground">Pro plan, renews on November 1.</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between gap-3 p-4 text-body">
        <span className="text-muted-foreground">Next invoice</span>
        <span className="tabular-nums">$240.00</span>
      </div>
    </div>
  );
}
