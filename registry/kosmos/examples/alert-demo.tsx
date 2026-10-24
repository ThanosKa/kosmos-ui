import { Alert, AlertDescription, AlertTitle } from '@/registry/kosmos/ui/alert';

export default function AlertDemo() {
  return (
    <Alert variant="warning" className="max-w-lg">
      <AlertTitle>Cirrus Weather is at 80% of its quota</AlertTitle>
      <AlertDescription>
        It will reach 3,000,000 events around October 18. <a href="https://acme.example/billing">Raise the allowance</a>
      </AlertDescription>
    </Alert>
  );
}
