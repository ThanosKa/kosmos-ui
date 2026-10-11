import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { XIcon } from '@/components/site/brand-icons';
import { appName, author, githubUrl } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
    },
    githubUrl,
    links: [{ type: 'icon', label: 'Thanos Kazakis on X', text: 'X', icon: <XIcon />, url: author.xUrl, external: true }],
  };
}
