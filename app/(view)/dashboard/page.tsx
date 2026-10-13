import type { Metadata } from 'next';
import { DashboardDocument } from '@/components/site/dashboard-document';

export const metadata: Metadata = { title: 'Parallax dashboard' };

/** The landing page's live dashboard on its own, the document its iframe shows. */
export default function DashboardPage() {
  return <DashboardDocument />;
}
