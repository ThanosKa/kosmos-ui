import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/kosmos/ui/accordion';

type FaqItem = {
  /** A stable key for the question, which `defaultValue` names to open it. */
  id: string;
  question: React.ReactNode;
  /** The answer under the question. Links in it take the ink underline. */
  answer: React.ReactNode;
};

// Sample data: replace it with your product's title, questions and contact link.
const sampleTitle = 'Questions before you start';

const sampleItems: FaqItem[] = [
  {
    id: 'first-event',
    question: 'How long until I see my first event?',
    answer:
      'About a minute. Add the script tag or the SDK for your platform, open your site or app, and the event shows up in Live events a second after it happens.',
  },
  {
    id: 'platforms',
    question: 'Which platforms can send events?',
    answer: 'Web, iOS, Android and your servers. Each has its own SDK, and a project can take events from all of them at once.',
  },
  {
    id: 'trial',
    question: 'Can I try Pro before I pay?',
    answer:
      'Yes. Every new project starts on a 14-day Pro trial with no card. When it ends, the project moves to Free unless you pick a plan.',
  },
  {
    id: 'limits',
    question: 'What happens when a project goes over its event allowance?',
    answer:
      'Nothing stops. Acme keeps collecting, and we write to you before the next bill so you can move to a bigger plan or set a limit.',
  },
  {
    id: 'export',
    question: 'Can I take my data with me?',
    answer: (
      <>
        Yes. Export any table as CSV, or send every event to your own storage each night on Scale. See <a href="https://acme.example/docs/export">exporting events</a>.
      </>
    ),
  },
];

const sampleContact = (
  <>
    Still have a question? <a href="/contact">Talk to the team</a>
  </>
);

const inlineLink =
  '[&_a]:rounded-sm [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-foreground/30 [&_a]:underline-offset-4 [&_a]:transition-[text-decoration-color] [&_a]:hover:decoration-foreground [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-ring';

type FaqProps = Omit<React.ComponentProps<'section'>, 'title' | 'defaultValue'> & {
  /** The section's heading. `null` leaves it out; then give the page a heading above the questions. */
  title?: React.ReactNode;
  /** The questions, in order. An empty list renders nothing. */
  items?: FaqItem[];
  /** The `id`s of the questions open at first. Defaults to the first question; `[]` opens none. */
  defaultValue?: string[];
  /** A line under the questions with a link to ask more, such as a contact page. `null` leaves it out. */
  contact?: React.ReactNode;
  /** The title is an `<h2>` and each question an `<h3>`; pass 3 for a section nested one level deeper. */
  headingLevel?: 2 | 3;
};

/**
 * Questions that open to their answers, one at a time, under a centered title, with a line to ask more below them.
 * The list keeps to a 672px column; the title grows to the section role from a 672px-wide container.
 */
function Faq({
  title = sampleTitle,
  items = sampleItems,
  defaultValue,
  contact = sampleContact,
  headingLevel = 2,
  className,
  ...props
}: FaqProps) {
  if (items.length === 0) return null;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const open = defaultValue ?? [items[0].id];
  return (
    <section data-slot="faq" className={cn('@container flex flex-col items-center gap-8 px-4 py-12 @2xl:gap-10 @2xl:px-6 @2xl:py-20', className)} {...props}>
      {title ? <Heading className="max-w-[20em] text-center text-heading font-semibold text-balance wrap-break-word text-foreground @2xl:text-display">{title}</Heading> : null}
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <Accordion headingLevel={headingLevel === 2 ? 3 : 4} defaultValue={open}>
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>
                <span className="min-w-0 text-pretty wrap-break-word">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className={cn('max-w-[40em] pe-8 wrap-break-word', inlineLink)}>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {contact ? (
          <p data-slot="faq-contact" className={cn('px-2 text-small text-pretty wrap-break-word text-muted-foreground', inlineLink)}>
            {contact}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export { Faq, type FaqItem, type FaqProps };
