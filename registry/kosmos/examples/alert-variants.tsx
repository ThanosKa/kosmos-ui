import { Alert, AlertDescription, AlertTitle } from '@/registry/kosmos/ui/alert';

export default function AlertVariants() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <Alert variant="neutral">
        <AlertTitle>Events arrive within a minute</AlertTitle>
        <AlertDescription>Counts on this page refresh every 60 seconds.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <AlertTitle>The EU data region is live</AlertTitle>
        <AlertDescription>New projects can keep their events in Frankfurt.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertTitle>Cirrus Weather is on the Scale plan</AlertTitle>
        <AlertDescription>Its allowance is now 8,000,000 events a month.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTitle>Ironbark Logistics is at 79% of its quota</AlertTitle>
        <AlertDescription>Events past the allowance are billed at the Scale rate.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Copperline Bank passed its quota</AlertTitle>
        <AlertDescription>It sent 8,730,100 events against an allowance of 8,000,000.</AlertDescription>
      </Alert>
    </div>
  );
}
