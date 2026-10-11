import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/kosmos/ui/accordion';

export default function AccordionDemo() {
  return (
    <Accordion defaultValue={['plans']} className="max-w-md">
      <AccordionItem value="plans">
        <AccordionTrigger>Can I change plans later?</AccordionTrigger>
        <AccordionContent>
          Yes. Upgrades apply right away and are prorated; downgrades apply at the end of the billing period.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="seats">
        <AccordionTrigger>How are seats counted?</AccordionTrigger>
        <AccordionContent>
          Every member who signed in during the billing period counts as one seat. Guests are free.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="export">
        <AccordionTrigger>Can I export my data?</AccordionTrigger>
        <AccordionContent>
          Export any project as CSV or JSON from its settings. Exports include comments and history.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
