import { User } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix } from '@/components/preview/state-matrix';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Button } from '@/registry/kosmos/ui/button';

const sizes = ['sm', 'md', 'lg'] as const;
const states = ['image', 'initials', 'icon'] as const;

export default function AvatarPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Sizes × content">
        <StateMatrix
          rows={sizes}
          states={states}
          render={(size, state) => (
            <Avatar size={size}>
              {state === 'image' ? <AvatarImage src="/avatars/avatar-1.png" alt="Maria Lopez" /> : null}
              <AvatarFallback>{state === 'icon' ? <User aria-label="Unknown user" /> : 'ML'}</AvatarFallback>
            </Avatar>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Group">
        <div className="flex flex-col gap-4">
          {sizes.map((size) => (
            <AvatarGroup key={size}>
              {[1, 2, 3, 4].map((n) => (
                <Avatar key={n} size={size}>
                  <AvatarImage src={`/avatars/avatar-${n}.png`} alt={`Teammate ${n}`} />
                  <AvatarFallback>T{n}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount size={size}>
                +3<span className="sr-only"> more</span>
              </AvatarGroupCount>
            </AvatarGroup>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="With a name, and as a button">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar size="lg">
              <AvatarImage src="/avatars/avatar-2.png" alt="" />
              <AvatarFallback>JK</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-body font-medium">Jonas Keller</span>
              <span className="truncate text-small text-muted-foreground">jonas@acme.com</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Open account menu" className="rounded-full">
            <Avatar size="sm">
              <AvatarImage src="/avatars/avatar-3.png" alt="" />
              <AvatarFallback>AN</AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </PreviewSection>

      <PreviewSection title="Long name in a narrow slot">
        <div className="flex w-48 min-w-0 items-center gap-2">
          <Avatar size="md">
            <AvatarFallback>AW</AvatarFallback>
          </Avatar>
          <span className="min-w-0 truncate text-body">Alexandra Wolfeschlegelsteinhausen</span>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
