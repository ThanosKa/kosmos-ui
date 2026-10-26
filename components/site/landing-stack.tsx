import type { ComponentType, SVGProps } from 'react';
import { LogoMarquee, type LogoMarqueeLogo } from '@/registry/kosmos/blocks/logo-marquee/logo-marquee';
import { BaseUiIcon, NextIcon, ReactIcon, ShadcnIcon, TailwindIcon } from './brand-icons';
import { stackBrandColors } from './stack-brands';

function stackLogo(name: string, Mark: ComponentType<SVGProps<SVGSVGElement>>, color: string): LogoMarqueeLogo {
  return {
    name,
    color,
    logo: (
      <span className="flex items-center gap-2.5">
        <Mark />
        {name}
      </span>
    ),
  };
}

const stack = [
  stackLogo('Base UI', BaseUiIcon, stackBrandColors.baseUi),
  stackLogo('Tailwind CSS', TailwindIcon, stackBrandColors.tailwind),
  stackLogo('React', ReactIcon, stackBrandColors.react),
  stackLogo('Next.js', NextIcon, stackBrandColors.next),
  stackLogo('shadcn CLI', ShadcnIcon, stackBrandColors.shadcn),
];

/** The landing's stack: what Kosmos is built on and installed with, in the Logo marquee block. */
export function LandingStack() {
  return <LogoMarquee title="Built on the stack you already use" logos={stack} />;
}
