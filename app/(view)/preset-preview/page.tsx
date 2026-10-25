import type { Metadata } from 'next';
import { PresetPreviewDocument } from '@/components/site/preset-preview-document';

export const metadata: Metadata = { title: 'Preset preview' };

/** The Presets page preview on its own, the document its iframe shows. */
export default function PresetPreviewPage() {
  return <PresetPreviewDocument />;
}
