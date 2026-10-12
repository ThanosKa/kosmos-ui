import { socialImage, socialImageSize } from '@/components/site/social-image';
import { appDescription, appName } from '@/lib/shared';

export const alt = `${appName}: components and blocks for dashboard apps`;
export const size = socialImageSize;
export const contentType = 'image/png';

export default function Image() {
  return socialImage({ title: 'Dashboard UI with the details already done', description: appDescription });
}
