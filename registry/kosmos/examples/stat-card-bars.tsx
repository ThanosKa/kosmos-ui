'use client';

import { Percent, Timer, TriangleAlert, UserPlus } from 'lucide-react';
import {
  StatCard,
  StatCardContent,
  StatCardDelta,
  StatCardEyebrow,
  StatCardHeader,
  StatCardIcon,
  StatCardLabel,
  StatCardSparkline,
  StatCardValue,
} from '@/registry/kosmos/ui/stat-card';

const weeks = (values: number[]) => values.map((value) => ({ value }));

export default function StatCardBars() {
  return (
    <div className="@container w-full">
      <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @5xl:grid-cols-4">
        <StatCard>
          <StatCardHeader>
            <StatCardIcon>
              <UserPlus />
            </StatCardIcon>
            <StatCardEyebrow>Every platform</StatCardEyebrow>
            <StatCardLabel>Signups</StatCardLabel>
          </StatCardHeader>
          <StatCardContent>
            <StatCardValue>1,284</StatCardValue>
            <StatCardDelta value={4.2}>(+52)</StatCardDelta>
            <StatCardSparkline
              variant="bar"
              data={weeks([96, 104, 99, 108, 112, 106, 115, 118, 112, 121])}
              aria-label="Signups, last 10 weeks, up 4.2%"
            />
          </StatCardContent>
        </StatCard>
        <StatCard>
          <StatCardHeader>
            <StatCardIcon>
              <Percent />
            </StatCardIcon>
            <StatCardEyebrow>Visit to signup</StatCardEyebrow>
            <StatCardLabel>Conversion</StatCardLabel>
          </StatCardHeader>
          <StatCardContent>
            <StatCardValue>3.3%</StatCardValue>
            <StatCardDelta value={0.4} unit="points">
              from 2.9%
            </StatCardDelta>
            <StatCardSparkline
              variant="bar"
              data={weeks([2.9, 3.0, 2.9, 3.1, 3.0, 3.1, 3.2, 3.1, 3.2, 3.3])}
              aria-label="Conversion, last 10 weeks, up 0.4 points"
            />
          </StatCardContent>
        </StatCard>
        <StatCard>
          <StatCardHeader>
            <StatCardIcon>
              <Timer />
            </StatCardIcon>
            <StatCardEyebrow>Per visit</StatCardEyebrow>
            <StatCardLabel>Median session</StatCardLabel>
          </StatCardHeader>
          <StatCardContent>
            <StatCardValue>4m 12s</StatCardValue>
            <StatCardDelta value={-3.2}>(−8s)</StatCardDelta>
            <StatCardSparkline
              variant="bar"
              data={weeks([262, 266, 259, 264, 258, 261, 255, 257, 254, 252])}
              aria-label="Median session, last 10 weeks, down 3.2%"
            />
          </StatCardContent>
        </StatCard>
        <StatCard>
          <StatCardHeader>
            <StatCardIcon>
              <TriangleAlert />
            </StatCardIcon>
            <StatCardEyebrow>Of all events</StatCardEyebrow>
            <StatCardLabel>Error events</StatCardLabel>
          </StatCardHeader>
          <StatCardContent>
            <StatCardValue>1.4%</StatCardValue>
            <StatCardDelta value={-0.5} unit="points" goodWhen="down">
              from 1.9%
            </StatCardDelta>
            <StatCardSparkline
              variant="bar"
              data={weeks([1.9, 1.8, 1.8, 1.7, 1.7, 1.6, 1.6, 1.5, 1.5, 1.4])}
              aria-label="Error events, last 10 weeks, down 0.5 points"
            />
          </StatCardContent>
        </StatCard>
      </div>
    </div>
  );
}
