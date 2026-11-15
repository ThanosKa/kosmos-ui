import { User } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix } from '@/components/preview/state-matrix';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Button } from '@/registry/kosmos/ui/button';

const sizes = ['sm', 'md', 'lg'] as const;
const states = ['image', 'initials', 'icon'] as const;
const team = [
  { id: 'lena', name: 'Lena Park', initials: 'LP' },
  { id: 'tomas', name: 'Tomás Ortega', initials: 'TO' },
  { id: 'ama', name: 'Ama Mensah', initials: 'AM' },
  { id: 'kai', name: 'Kai Nakamura', initials: 'KN' },
];

export default function AvatarPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Sizes × content">
        <StateMatrix
          rows={sizes}
          states={states}
          render={(size, state) => (
            <Avatar size={size}>
              {state === 'image' ? <AvatarImage src="/avatars/lena.jpg" alt="Lena Park" /> : null}
              <AvatarFallback>{state === 'icon' ? <User aria-label="Unknown user" /> : 'LP'}</AvatarFallback>
            </Avatar>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Group">
        <div className="flex flex-col gap-4">
          {sizes.map((size) => (
            <AvatarGroup key={size}>
              {team.map((person) => (
                <Avatar key={person.id} size={size}>
                  <AvatarImage src={`/avatars/${person.id}.jpg`} alt={person.name} />
                  <AvatarFallback>{person.initials}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount size={size}>
                +3<span className="sr-only"> more</span>
              </AvatarGroupCount>
            </AvatarGroup>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Logo: a square avatar">
        <StateMatrix
          rows={sizes}
          states={['image', 'initial'] as const}
          render={(size, state) => (
            <Avatar size={size} className="rounded-md">
              {state === 'image' ? <AvatarImage src="/logos/cirrus.svg" alt="Cirrus Weather" /> : null}
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
          )}
        />
      </PreviewSection>

      <PreviewSection title="With a name, and as a button">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar size="lg">
              <AvatarImage src="/avatars/tomas.jpg" alt="" />
              <AvatarFallback>TO</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-body font-medium">Tomás Ortega</span>
              <span className="truncate text-small text-muted-foreground">tomas@acme.example</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Open user menu" className="rounded-full">
            <Avatar size="sm">
              <AvatarImage src="/avatars/ama.jpg" alt="" />
              <AvatarFallback>AM</AvatarFallback>
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
