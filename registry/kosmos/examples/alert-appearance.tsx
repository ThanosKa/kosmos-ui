import { Alert, AlertTitle } from '@/registry/kosmos/ui/alert';

export default function AlertAppearance() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <Alert variant="warning">
        <AlertTitle>Ironbark Logistics is at 79% of its quota</AlertTitle>
      </Alert>
      <Alert variant="warning" appearance="subtle">
        <AlertTitle>Ironbark Logistics is at 79% of its quota</AlertTitle>
      </Alert>
    </div>
  );
}
