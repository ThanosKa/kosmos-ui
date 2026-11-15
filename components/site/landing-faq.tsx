import Link from 'next/link';
import { docsRoute, githubUrl } from '@/lib/shared';
import { Faq, type FaqItem } from '@/registry/kosmos/blocks/faq/faq';

const items: FaqItem[] = [
  {
    id: 'free',
    question: 'Is Kosmos UI free?',
    answer:
      'Yes. Every component and block in the repository is free under the MIT license, for personal and commercial work, with no account to sign up for.',
  },
  {
    id: 'shadcn',
    question: 'Do I need shadcn/ui?',
    answer: (
      <>
        You need the shadcn CLI, which copies each item into your project. You don&rsquo;t need its components: Kosmos builds its own on Base UI, and
        its Button takes shadcn&rsquo;s variant names, so shadcn components keep working. See <Link href={`${docsRoute}/installation`}>installation</Link>.
      </>
    ),
  },
  {
    id: 'project',
    question: 'What does my project need?',
    answer: 'React 19 and Tailwind CSS 4, in a project the shadcn CLI can set up, such as a Next.js app. The tokens arrive with the first item you add.',
  },
  {
    id: 'look',
    question: 'Can I change how it looks?',
    answer: (
      <>
        Yes. Pick a preset on the <Link href="/presets">Presets page</Link> and copy its CSS, or change the tokens in one file. Every color, radius and
        shadow comes from them.
      </>
    ),
  },
  {
    id: 'agents',
    question: 'Can my coding agent use it?',
    answer: (
      <>
        Yes. Every docs page comes as Markdown too, and <a href="/llms.txt">llms.txt</a> lists them all, so an agent reads the same docs you do.
      </>
    ),
  },
  {
    id: 'pro',
    question: 'What does Pro add?',
    answer:
      'More variants of each block category and templates you can run as whole apps. You pay once, keep the updates, and install Pro with the same shadcn CLI.',
  },
];

/** The landing's questions, in the FAQ block. */
export function LandingFaq() {
  return (
    <Faq
      title={null}
      items={items}
      contact={
        <>
          Still have a question? <a href={`${githubUrl}/issues`}>Ask on GitHub</a>
        </>
      }
    />
  );
}
