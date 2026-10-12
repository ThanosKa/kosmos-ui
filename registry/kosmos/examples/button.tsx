import { ArrowRight, Plus, Settings } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Button } from '@/registry/kosmos/ui/button';

const variants = ['primary', 'secondary', 'ghost', 'destructive', 'item'] as const;

/** shadcn's names, each beside the Kosmos name it renders as. Kosmos code never writes them (ESLint). */
const variantAliases = [
  ['default', 'primary'],
  ['outline', 'secondary'],
] as const;
const sizeAliases = [
  ['default', 'md'],
  ['xs', 'sm'],
] as const;
const iconAlias = 'icon-xs';
const shadcnOnly = ['link'] as const;

export default function ButtonPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Variants × states">
        <StateMatrix
          rows={variants}
          render={(variant, state) => (
            <Button variant={variant} {...previewState(state)}>
              {variant === 'destructive' ? 'Delete' : 'Save changes'}
            </Button>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Sizes">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm">
            Small
          </Button>
          <Button variant="secondary" size="md">
            Medium
          </Button>
          <Button variant="secondary" size="lg">
            Large
          </Button>
          <Button variant="secondary" size="icon-sm" aria-label="Open settings">
            <Settings />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Open settings">
            <Settings />
          </Button>
          <Button variant="secondary" size="icon-lg" aria-label="Open settings">
            <Settings />
          </Button>
        </div>
      </PreviewSection>

      <PreviewSection title="With icons and as a link">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">
            <Plus data-icon="inline-start" />
            New project
          </Button>
          <Button variant="secondary">
            Continue
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button variant="secondary" size="sm">
            <Plus data-icon="inline-start" />
            Add filter
          </Button>
          <Button variant="ghost" size="icon" aria-label="Open settings">
            <Settings />
          </Button>
          <Button variant="secondary" href="#docs">
            Read the docs
          </Button>
        </div>
      </PreviewSection>

      <PreviewSection title="shadcn names: alias beside its Kosmos name">
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
          {variantAliases.map(([alias, kosmos]) => (
            <li key={alias} className="flex flex-col items-start gap-2">
              <span className="font-mono text-caption text-muted-foreground">
                variant {alias} = {kosmos}
              </span>
              <div className="flex gap-2">
                <Button variant={alias}>Save changes</Button>
                <Button variant={kosmos}>Save changes</Button>
              </div>
            </li>
          ))}
          {sizeAliases.map(([alias, kosmos]) => (
            <li key={alias} className="flex flex-col items-start gap-2">
              <span className="font-mono text-caption text-muted-foreground">
                size {alias} = {kosmos}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size={alias}>
                  Save changes
                </Button>
                <Button variant="secondary" size={kosmos}>
                  Save changes
                </Button>
              </div>
            </li>
          ))}
          <li className="flex flex-col items-start gap-2">
            <span className="font-mono text-caption text-muted-foreground">size icon-xs = icon-sm</span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size={iconAlias} aria-label="Open settings">
                <Settings />
              </Button>
              <Button variant="secondary" size="icon-sm" aria-label="Open settings">
                <Settings />
              </Button>
            </div>
          </li>
        </ul>
        <StateMatrix
          rows={shadcnOnly}
          render={(variant, state) => (
            <Button variant={variant} {...previewState(state)}>
              Forgot password?
            </Button>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Long label in a narrow slot">
        <div className="flex w-48 flex-col gap-2">
          <Button variant="secondary" className="w-full">
            <span className="min-w-0 truncate">Export every invoice from the last quarter</span>
          </Button>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
