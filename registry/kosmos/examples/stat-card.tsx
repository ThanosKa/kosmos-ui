'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import {
  StatCard,
  StatCardDelta,
  StatCardDescription,
  StatCardLabel,
  StatCardSparkline,
  StatCardValue,
} from '@/registry/kosmos/ui/stat-card';

const trend = (values: number[]) => values.map((value) => ({ value }));

const users = trend([26800, 27100, 26900, 27600, 27400, 28100, 28300, 28000, 28700, 29100, 28900, 29400]);
const events = trend([880, 902, 915, 940, 921, 958, 990, 1004, 978, 1012, 996, 1012]);
const revenue = trend([13700, 13700, 13850, 13850, 14100, 14100, 14280, 14280, 14480, 14480, 14628, 14628]);
const projects = trend([9, 9, 9, 9, 9, 9, 8, 8, 8, 8, 8, 8]);
const errorRate = trend([1.9, 1.8, 1.8, 1.7, 1.7, 1.6, 1.6, 1.5, 1.5, 1.4, 1.4, 1.4]);
const flat = trend([8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);

const grid = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4';

export default function StatCardPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Overview, last 30 days">
        <div className={grid}>
          <StatCard>
            <StatCardLabel>Active users</StatCardLabel>
            <StatCardValue>144,600</StatCardValue>
            <StatCardDelta value={9.6}>vs previous 30 days</StatCardDelta>
            <StatCardSparkline data={users} aria-label="Active users, last 30 days, up 9.6%" />
          </StatCard>
          <StatCard>
            <StatCardLabel>Events</StatCardLabel>
            <StatCardValue>28.5M</StatCardValue>
            <StatCardDelta value={14.2}>vs previous 30 days</StatCardDelta>
            <StatCardSparkline data={events} aria-label="Events, last 30 days, up 14.2%" />
          </StatCard>
          <StatCard>
            <StatCardLabel>Monthly revenue</StatCardLabel>
            <StatCardValue>$14,628</StatCardValue>
            <StatCardDelta value={6.8}>vs previous 30 days</StatCardDelta>
            <StatCardSparkline data={revenue} aria-label="Monthly revenue, last 30 days, up 6.8%" />
          </StatCard>
          <StatCard>
            <StatCardLabel>Live projects</StatCardLabel>
            <StatCardValue>8</StatCardValue>
            <StatCardDelta value={-11.1}>vs previous 30 days</StatCardDelta>
            <StatCardSparkline data={projects} aria-label="Live projects, last 30 days, down 11.1%" />
          </StatCard>
        </div>
      </PreviewSection>

      <PreviewSection title="Deltas: rise, fall, falling is good, rising is bad, no change, neither">
        <div className={grid}>
          <StatCard>
            <StatCardLabel>Active users</StatCardLabel>
            <StatCardValue>144,600</StatCardValue>
            <StatCardDelta value={9.6}>vs September</StatCardDelta>
          </StatCard>
          <StatCard>
            <StatCardLabel>Live projects</StatCardLabel>
            <StatCardValue>8</StatCardValue>
            <StatCardDelta value={-11.1}>vs September</StatCardDelta>
          </StatCard>
          <StatCard>
            <StatCardLabel>Error events</StatCardLabel>
            <StatCardValue>1.4%</StatCardValue>
            <StatCardDelta value={-0.5} unit="points" goodWhen="down">
              vs September
            </StatCardDelta>
          </StatCard>
          <StatCard>
            <StatCardLabel>Rate-limited requests</StatCardLabel>
            <StatCardValue>0.7%</StatCardValue>
            <StatCardDelta value={0.3} unit="points" goodWhen="down">
              vs September
            </StatCardDelta>
          </StatCard>
          <StatCard>
            <StatCardLabel>Live projects, 7 days</StatCardLabel>
            <StatCardValue>8</StatCardValue>
            <StatCardDelta value={0}>vs last week</StatCardDelta>
          </StatCard>
          <StatCard>
            <StatCardLabel>Median session</StatCardLabel>
            <StatCardValue>4m 12s</StatCardValue>
            <StatCardDelta value={5.2} goodWhen="neither">
              vs September
            </StatCardDelta>
          </StatCard>
          <StatCard>
            <StatCardLabel>Agent budget used</StatCardLabel>
            <StatCardValue>$1,240</StatCardValue>
            <StatCardDescription>No earlier period</StatCardDescription>
          </StatCard>
          <StatCard>
            <StatCardLabel>Events</StatCardLabel>
            <StatCardValue>28.5M</StatCardValue>
            <StatCardDelta value={14.2} />
          </StatCard>
        </div>
      </PreviewSection>

      <PreviewSection title="Loading">
        <div className={grid}>
          <StatCard loading>
            <StatCardLabel>Active users</StatCardLabel>
            <StatCardValue>144,600</StatCardValue>
            <StatCardDelta value={9.6}>vs previous 30 days</StatCardDelta>
            <StatCardSparkline data={users} aria-label="Active users, last 30 days, up 9.6%" />
          </StatCard>
          <StatCard loading>
            <StatCardLabel>Error events</StatCardLabel>
            <StatCardValue>1.4%</StatCardValue>
            <StatCardDelta value={-0.5} unit="points" goodWhen="down">
              vs September
            </StatCardDelta>
          </StatCard>
        </div>
      </PreviewSection>

      <PreviewSection title="Long text and extreme values">
        <div className={grid}>
          <StatCard>
            <StatCardLabel>Events received across every project and region</StatCardLabel>
            <StatCardValue>1,284,502,920</StatCardValue>
            <StatCardDelta value={1240.5}>vs the same 30 days of the previous year, before the EU region</StatCardDelta>
            <StatCardSparkline data={events} aria-label="Events, last 30 days, up 1,240.5%" />
          </StatCard>
          <StatCard>
            <StatCardLabel>Error events</StatCardLabel>
            <StatCardValue>0.18%</StatCardValue>
            <StatCardDelta value={-99.94}>vs September</StatCardDelta>
            <StatCardSparkline data={errorRate} aria-label="Error events, last 30 days, down 99.9%" />
          </StatCard>
          <StatCard>
            <StatCardLabel>イベント</StatCardLabel>
            <StatCardValue>3</StatCardValue>
            <StatCardDelta value={0.04}>vs September</StatCardDelta>
            <StatCardSparkline data={flat} aria-label="Events, last 30 days, no change" />
          </StatCard>
          <div className="w-40">
            <StatCard>
              <StatCardLabel>Monthly revenue</StatCardLabel>
              <StatCardValue>$14,628</StatCardValue>
              <StatCardDelta value={6.8}>vs September</StatCardDelta>
              <StatCardSparkline data={revenue} aria-label="Monthly revenue, last 30 days, up 6.8%" />
            </StatCard>
          </div>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
