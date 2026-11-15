import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/registry/kosmos/ui/alert';
import { Button } from '@/registry/kosmos/ui/button';

export default function AlertActionExample() {
  return (
    <Alert variant="destructive" className="max-w-xl">
      <AlertTitle>Hollow Oak Games stopped sending events</AlertTitle>
      <AlertDescription>The last one arrived on September 18, when the project was paused.</AlertDescription>
      <AlertAction>
        <Button variant="secondary" size="sm">
          Resume the project
        </Button>
      </AlertAction>
    </Alert>
  );
}
