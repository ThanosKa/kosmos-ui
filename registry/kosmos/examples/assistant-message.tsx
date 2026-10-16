'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { AssistantMessage, Citation, type Source } from '@/registry/kosmos/ui/assistant-message';

const sources: Source[] = [
  { id: 'usage', title: 'Acme · Events by project, last 30 days', url: 'https://acme.example/usage', domain: 'acme.example' },
  { id: 'quota', title: 'Event allowance by plan', url: 'https://docs.acme.example/plans', domain: 'docs.acme.example' },
];

const answer = (
  <>
    Acme collected 28,495,200 events in the last 30 days, 14.2% more than the 30 days before<Citation n={1} source={sources[0]} />.
    Three projects are close to or over their event quota<Citation n={2} source={sources[1]} />.
  </>
);

const card = 'rounded-2xl border border-transparent bg-card p-4 shadow-card';

const retry = () => {};

export default function AssistantMessagePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Prompt and reply, actions always shown">
        <div className={`${card} flex flex-col gap-4`}>
          <AssistantMessage role="user">How many events did Acme collect in the last 30 days?</AssistantMessage>
          <AssistantMessage author={{ name: 'Acme agent' }} time="14:02" model="Claude Sonnet 5.5" onRetry={retry}>
            {answer}
          </AssistantMessage>
        </div>
      </PreviewSection>

      <div className="grid gap-10 md:grid-cols-2">
        <PreviewSection title="Sources open, follow-ups, Good answer pressed">
          <div className={card}>
            <AssistantMessage
              author={{ name: 'Acme agent' }}
              time="14:02"
              model="Claude Sonnet 5.5"
              sources={sources}
              defaultSourcesOpen
              followUps={['Show the three projects', 'Draft a note for Tomás Ortega']}
              defaultFeedback="up"
              onRetry={retry}
            >
              {answer}
            </AssistantMessage>
          </div>
        </PreviewSection>

        <PreviewSection title="actionsVisibility hover, not hovered">
          <div className={card}>
            <AssistantMessage
              author={{ name: 'Acme agent' }}
              time="14:01"
              model="Claude Sonnet 5.5"
              sources={sources}
              actionsVisibility="hover"
              onRetry={retry}
            >
              {answer}
            </AssistantMessage>
          </div>
        </PreviewSection>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <PreviewSection title="Streaming">
          <div className={card}>
            <AssistantMessage
              status="streaming"
              author={{ name: 'Acme agent' }}
              time="14:03"
              model="Claude Sonnet 5.5"
              sources={sources}
            >
              Three projects are close to or over their event quota: Copperline Bank, Cirrus Weather and Ironbark
              Logistics. Two of them send from servers
            </AssistantMessage>
          </div>
        </PreviewSection>

        <PreviewSection title="Error">
          <div className={card}>
            <AssistantMessage
              status="error"
              error="The events export timed out."
              author={{ name: 'Acme agent' }}
              time="14:04"
              model="Claude Haiku 5.5"
              onRetry={retry}
            >
              Pulling events for the last 30 days
            </AssistantMessage>
          </div>
        </PreviewSection>
      </div>

      <PreviewSection title="Long answer with a list">
        <div className={card}>
          <AssistantMessage author={{ name: 'Acme agent' }} time="14:06" model="Claude Opus 5.5" sources={sources}>
            <p>
              Events grew 14.2% in the last 30 days, faster than the 6.8% growth in revenue, so more projects are close to
              their allowance<Citation n={1} source={sources[0]} />. Lena asked for a short list of the projects worth
              checking this week, and these are the ones that moved the most:
            </p>
            <ul className="my-2 list-disc ps-5">
              <li>Copperline Bank: events at 109% of the Scale allowance, up 12% on the 30 days before.</li>
              <li>Cirrus Weather: traffic doubled for three days after the storm on October 2.</li>
              <li>Hollow Oak Games: no events since the project was paused on 18 September.</li>
            </ul>
            <p>
              A higher plan raises the event allowance<Citation n={2} source={sources[1]} />, so ask Lena Park to
              approve it early.
            </p>
          </AssistantMessage>
        </div>
      </PreviewSection>

      <PreviewSection title="Long text in a narrow panel">
        <div className={`${card} flex w-full max-w-80 flex-col gap-4`}>
          <AssistantMessage role="user">
            {'Compare https://acme.example/reports/events/2026/10/events-by-project-and-platform with last month\nand list the biggest changes.'}
          </AssistantMessage>
          <AssistantMessage
            author={{ name: 'Event analytics agent for the Acme growth and platform teams' }}
            time="14:08"
            model="Claude Sonnet 5.5"
            sources={[
              {
                id: 'long',
                title: 'Events by project and platform, October 2026, exported from the usage dashboard',
                url: 'https://reports.analytics.acme.example/events',
                domain: 'reports.analytics.acme.example',
              },
            ]}
            defaultSourcesOpen
            followUps={['Break the change down by platform and by plan for the three largest projects']}
            onRetry={retry}
          >
            Brightloop Fitness grew the most, by 9,400 events a day, almost all of it from its iOS app.
          </AssistantMessage>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
