import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/kosmos/ui/accordion';

export default function AccordionMultiple() {
  return (
    <Accordion multiple defaultValue={['email', 'push']} className="max-w-md">
      <AccordionItem value="email">
        <AccordionTrigger>Email</AccordionTrigger>
        <AccordionContent>A daily summary of mentions, assignments and failed deploys.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="push">
        <AccordionTrigger>Push</AccordionTrigger>
        <AccordionContent>Mentions and assignments, as they happen.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="slack">
        <AccordionTrigger>Slack</AccordionTrigger>
        <AccordionContent>Failed deploys, posted to the channel you pick.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
