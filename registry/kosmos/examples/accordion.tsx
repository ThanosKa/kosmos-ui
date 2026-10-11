import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix } from '@/components/preview/state-matrix';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/kosmos/ui/accordion';
import { Button } from '@/registry/kosmos/ui/button';

const rows = ['closed', 'open'] as const;

const faq = [
  {
    value: 'plans',
    question: 'Can I change plans later?',
    answer: 'Yes. Upgrades apply right away and are prorated; downgrades apply at the end of the billing period.',
  },
  {
    value: 'seats',
    question: 'How are seats counted?',
    answer: 'Every member who signed in during the billing period counts as one seat. Guests are free.',
  },
  {
    value: 'export',
    question: 'Can I export my data?',
    answer: 'Export any project as CSV or JSON from its settings. Exports include comments and history.',
  },
  {
    value: 'cancel',
    question: 'What happens when I cancel?',
    answer: 'The workspace becomes read-only. Your data stays for 30 days, then it is deleted for good.',
  },
];

const card = 'rounded-2xl border border-transparent bg-card px-2 py-1 shadow-card';

export default function AccordionPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Closed and open × states">
        <StateMatrix
          rows={rows}
          render={(row, state) => (
            <Accordion defaultValue={row === 'open' ? ['item'] : []}>
              <AccordionItem value="item" disabled={state === 'disabled'}>
                <AccordionTrigger data-preview={['hover', 'focus', 'active'].includes(state) ? state : undefined}>
                  Billing
                </AccordionTrigger>
                <AccordionContent>Paid monthly.</AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        />
      </PreviewSection>

      <div className="grid gap-10 md:grid-cols-2">
        <PreviewSection title="In a card, one section open">
          <div className={card}>
            <Accordion defaultValue={['seats']}>
              {faq.map((item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </PreviewSection>

        <PreviewSection title="multiple, two sections open">
          <Accordion multiple defaultValue={['plans', 'export']}>
            {faq.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </PreviewSection>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <PreviewSection title="Long heading in a narrow slot">
          <div className="w-full max-w-64">
            <Accordion defaultValue={['long']}>
              <AccordionItem value="long">
                <AccordionTrigger>What happens to scheduled exports when a workspace changes owner?</AccordionTrigger>
                <AccordionContent>
                  They keep running under the new owner, who gets an email listing every schedule that moved over.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="short">
                <AccordionTrigger>Who can see exports?</AccordionTrigger>
                <AccordionContent>Admins and the member who created them.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </PreviewSection>

        <PreviewSection title="With actions inside">
          <Accordion defaultValue={['danger']}>
            <AccordionItem value="general">
              <AccordionTrigger>General</AccordionTrigger>
              <AccordionContent>Workspace name, URL and time zone.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="danger">
              <AccordionTrigger>Delete workspace</AccordionTrigger>
              <AccordionContent className="flex flex-col items-start gap-3">
                <p>Deletes every project, member and invoice in this workspace. This can’t be undone.</p>
                <Button variant="destructive" size="sm">
                  Delete workspace
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PreviewSection>
      </div>
    </PreviewStack>
  );
}
