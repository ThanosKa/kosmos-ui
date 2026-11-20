import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { BrowserFrame } from '@/registry/kosmos/ui/browser-frame';
import { DataSetPreview } from '@/components/preview/data-set-preview';

const body = <div className="flex h-40 items-center justify-center text-small text-muted-foreground">Content</div>;

function Normal() {
  return (
    <>
      <PreviewSection title="With an address">
        <BrowserFrame url="acme.example/overview">{body}</BrowserFrame>
      </PreviewSection>
      <PreviewSection title="Dots only">
        <BrowserFrame>{body}</BrowserFrame>
      </PreviewSection>
      <PreviewSection title="Tilt">
        <div className="py-4">
          <BrowserFrame tilt url="acme.example/reports">
            {body}
          </BrowserFrame>
        </div>
      </PreviewSection>
    </>
  );
}

function Worst() {
  return (
    <>
          <PreviewSection title="Long address, narrow">
      <BrowserFrame className="max-w-80" url="acme.example/projects/cirrus/environments/production/deployments/12345?filter=failed">
        {body}
      </BrowserFrame>
    </PreviewSection>
    </>
  );
}

export default function BrowserFramePreview() {
  return (
    <DataSetPreview
      demo={
        <PreviewStack>
          <Normal />
        </PreviewStack>
      }
      worst={
        <PreviewStack>
          <Worst />
        </PreviewStack>
      }
    />
  );
}
