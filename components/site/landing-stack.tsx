import type { ComponentType, SVGProps } from 'react';
import { LogoMarquee, type LogoMarqueeLogo } from '@/registry/kosmos/blocks/logo-marquee/logo-marquee';
import { BaseUiIcon, NextIcon, ReactIcon, ShadcnIcon, TailwindIcon } from './brand-icons';

function stackLogo(name: string, Mark: ComponentType<SVGProps<SVGSVGElement>>): LogoMarqueeLogo {
  return {
    name,
    logo: (
      <span className="flex items-center gap-2.5">
        <Mark />
        {name}
      </span>
    ),
  };
}

const stack = [
  stackLogo('Base UI', BaseUiIcon),
  stackLogo('Tailwind CSS', TailwindIcon),
  stackLogo('React', ReactIcon),
  stackLogo('Next.js', NextIcon),
  stackLogo('shadcn CLI', ShadcnIcon),
];

/** The landing's stack: what Kosmos is built on and installed with, in the Logo marquee block. */
export function LandingStack() {
  return <LogoMarquee title="Built on the stack you already use" logos={stack} />;
}
