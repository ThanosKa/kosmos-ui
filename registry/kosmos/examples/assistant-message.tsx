'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { AssistantMessage, Citation, type Source } from '@/registry/kosmos/ui/assistant-message';

const sources: Source[] = [
  { id: 'usage', title: 'Acme Inc. · Q3 usage export', url: '#usage', domain: 'acme.example' },
  { id: 'quota', title: 'Quota policy for event ingestion', url: '#quota', domain: 'docs.acme.example' },
];

const answer = (
  <>
    The Acme Inc. workspace tracked 48,210 events in Q3, 18% more than Q2<Citation n={1} source={sources[0]} />.
    Three projects are above 90% of quota<Citation n={2} source={sources[1]} />.
  </>
);

const card = 'rounded-2xl border border-transparent bg-card p-4 shadow-card';

const retry = () => {};

export default function AssistantMessagePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Prompt and reply, actions always shown">
        <div className={`${card} flex flex-col gap-4`}>
          <AssistantMessage role="user">How many events did Acme Inc. ingest in Q3?</AssistantMessage>
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
              followUps={['Show the three projects', 'Draft a note to the Data team']}
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
              Three projects are above 90% of their event quota: Checkout, Mobile and Partner API. The Growth team owns
              the first two
            </AssistantMessage>
          </div>
        </PreviewSection>

        <PreviewSection title="Error">
          <div className={card}>
            <AssistantMessage
              status="error"
              error="The usage export timed out."
              author={{ name: 'Acme agent' }}
              time="14:04"
              model="Claude Haiku 5.5"
              onRetry={retry}
            >
              Pulling the revenue dashboard for the last 30 days
            </AssistantMessage>
          </div>
        </PreviewSection>
      </div>

      <PreviewSection title="Long answer with a list">
        <div className={card}>
          <AssistantMessage author={{ name: 'Acme agent' }} time="14:06" model="Claude Opus 5.5" sources={sources}>
            <p>
              Revenue grew in every plan this quarter, but event volume grew faster than seats, so usage-based overage
              now drives most of the change<Citation n={1} source={sources[0]} />. The Analyst asked for a short list
              of the dashboards worth checking before the review, and these are the ones that moved the most:
            </p>
            <ul className="my-2 list-disc ps-5">
              <li>Checkout funnel: conversion up 4.2 points after the new onboarding flow.</li>
              <li>Mobile retention: week-four active users down 6% among accounts created in August.</li>
              <li>Partner API: 31 of 40 integrations are within 10% of their monthly event quota.</li>
            </ul>
            <p>
              Quota changes need approval from an admin<Citation n={2} source={sources[1]} />, so raise the request
              early.
            </p>
          </AssistantMessage>
        </div>
      </PreviewSection>

      <PreviewSection title="Long text in a narrow panel">
        <div className={`${card} flex w-full max-w-80 flex-col gap-4`}>
          <AssistantMessage role="user">
            {'Compare https://acme.example/reports/usage/2026/q3/events-by-project-and-region with last quarter\nand list the biggest changes.'}
          </AssistantMessage>
          <AssistantMessage
            author={{ name: 'Workspace analytics agent for the Growth team' }}
            time="14:08"
            model="Claude Sonnet 5.5"
            sources={[
              {
                id: 'long',
                title: 'Events by project and region, Q3 2026, exported from the usage dashboard',
                url: '#long',
                domain: 'reports.analytics.acme.example',
              },
            ]}
            defaultSourcesOpen
            followUps={['Break the change down by region and by plan for the three largest projects']}
            onRetry={retry}
          >
            Partner API grew the most, by 9,400 events, almost all of it from two integrations in the EU region.
          </AssistantMessage>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
