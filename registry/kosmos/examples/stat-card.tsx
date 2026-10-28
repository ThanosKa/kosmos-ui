'use client';

import { Activity, Users } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import StatCardBars from '@/registry/kosmos/examples/stat-card-bars';
import StatCardKpi from '@/registry/kosmos/examples/stat-card-kpi';
import {
  StatCard,
  StatCardContent,
  StatCardDelta,
  StatCardDescription,
  StatCardEyebrow,
  StatCardHeader,
  StatCardIcon,
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
const signups = trend([96, 104, 99, 108, 112, 106, 115, 118, 112, 121]);
const sparse = trend([0, 3, 0, 0, 5, 2, 0, 1, 0, 4]);
const daily = trend(Array.from({ length: 40 }, (_, day) => 50 + ((day * 37) % 23) + day));

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

      <PreviewSection title="KPI tiles: icon, eyebrow, and a line sparkline beside the value">
        <StatCardKpi />
      </PreviewSection>

      <PreviewSection title="KPI tiles: bar sparkline, the latest bar in ink">
        <StatCardBars />
      </PreviewSection>

      <PreviewSection title="KPI parts one at a time: no eyebrow, no icon, no sparkline, bars under the number">
        <div className={grid}>
          <StatCard>
            <StatCardHeader>
              <StatCardIcon>
                <Users />
              </StatCardIcon>
              <StatCardLabel>Active users</StatCardLabel>
            </StatCardHeader>
            <StatCardContent>
              <StatCardValue>144,600</StatCardValue>
              <StatCardDelta value={9.6}>(+12,666)</StatCardDelta>
              <StatCardSparkline data={users} aria-label="Active users, last 30 days, up 9.6%" />
            </StatCardContent>
          </StatCard>
          <StatCard>
            <StatCardHeader>
              <StatCardEyebrow>Every project</StatCardEyebrow>
              <StatCardLabel>Events</StatCardLabel>
            </StatCardHeader>
            <StatCardContent>
              <StatCardValue>28.5M</StatCardValue>
              <StatCardDelta value={14.2}>(+3.5M)</StatCardDelta>
              <StatCardSparkline variant="bar" data={signups} aria-label="Events, last 10 weeks, up 14.2%" />
            </StatCardContent>
          </StatCard>
          <StatCard>
            <StatCardHeader>
              <StatCardIcon>
                <Activity />
              </StatCardIcon>
              <StatCardEyebrow>Every project</StatCardEyebrow>
              <StatCardLabel>Events</StatCardLabel>
            </StatCardHeader>
            <StatCardContent>
              <StatCardValue>28.5M</StatCardValue>
              <StatCardDelta value={14.2}>(+3.5M)</StatCardDelta>
            </StatCardContent>
          </StatCard>
          <StatCard>
            <StatCardLabel>Signups</StatCardLabel>
            <StatCardValue>1,284</StatCardValue>
            <StatCardDelta value={4.2}>vs September</StatCardDelta>
            <StatCardSparkline variant="bar" data={signups} aria-label="Signups, last 10 weeks, up 4.2%" />
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
            <StatCardHeader>
              <StatCardIcon>
                <Users />
              </StatCardIcon>
              <StatCardEyebrow>Web and apps</StatCardEyebrow>
              <StatCardLabel>Active users</StatCardLabel>
            </StatCardHeader>
            <StatCardContent>
              <StatCardValue>144,600</StatCardValue>
              <StatCardDelta value={9.6}>(+12,666)</StatCardDelta>
              <StatCardSparkline data={users} aria-label="Active users, last 30 days, up 9.6%" />
            </StatCardContent>
          </StatCard>
          <StatCard loading>
            <StatCardHeader>
              <StatCardIcon>
                <Users />
              </StatCardIcon>
              <StatCardEyebrow>New accounts</StatCardEyebrow>
              <StatCardLabel>Signups</StatCardLabel>
            </StatCardHeader>
            <StatCardContent>
              <StatCardValue>1,284</StatCardValue>
              <StatCardDelta value={4.2}>(+52)</StatCardDelta>
              <StatCardSparkline variant="bar" data={signups} aria-label="Signups, last 10 weeks, up 4.2%" />
            </StatCardContent>
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
          <StatCard>
            <StatCardHeader>
              <StatCardIcon>
                <Activity />
              </StatCardIcon>
              <StatCardEyebrow>Every project and region, web, iOS, Android and server</StatCardEyebrow>
              <StatCardLabel>Events received across every project and region</StatCardLabel>
            </StatCardHeader>
            <StatCardContent>
              <StatCardValue>1,284,502,920</StatCardValue>
              <StatCardDelta value={1240.5}>(+1,188,754,310 against the same 30 days last year)</StatCardDelta>
              <StatCardSparkline variant="bar" data={daily} aria-label="Events, last 40 days, up 1,240.5%" />
            </StatCardContent>
          </StatCard>
          <StatCard>
            <StatCardHeader>
              <StatCardIcon>
                <Users />
              </StatCardIcon>
              <StatCardEyebrow>ウェブとアプリ</StatCardEyebrow>
              <StatCardLabel>アクティブユーザー</StatCardLabel>
            </StatCardHeader>
            <StatCardContent>
              <StatCardValue>3</StatCardValue>
              <StatCardDelta value={0}>(±0)</StatCardDelta>
              <StatCardSparkline variant="bar" data={sparse} aria-label="Active users, last 10 weeks, no change" />
            </StatCardContent>
          </StatCard>
          <div className="w-40">
            <StatCard>
              <StatCardHeader>
                <StatCardIcon>
                  <Users />
                </StatCardIcon>
                <StatCardEyebrow>Web and apps</StatCardEyebrow>
                <StatCardLabel>Active users</StatCardLabel>
              </StatCardHeader>
              <StatCardContent>
                <StatCardValue>144,600</StatCardValue>
                <StatCardDelta value={9.6}>(+12,666)</StatCardDelta>
                <StatCardSparkline data={users} aria-label="Active users, last 30 days, up 9.6%" />
              </StatCardContent>
            </StatCard>
          </div>
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
