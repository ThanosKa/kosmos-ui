import Image from 'next/image';
import type { ComponentProps } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type ImageSource = ComponentProps<typeof Image>['src'];

/** A Markdown image through `next/image`, with the content-image edge. Fumadocs' remark-image supplies the width and height. */
export function DocsImage({ src, alt = '', width, height, className, ...props }: ComponentProps<'img'>) {
  return (
    <Image
      src={src as ImageSource}
      alt={alt}
      width={width === undefined ? undefined : Number(width)}
      height={height === undefined ? undefined : Number(height)}
      sizes="(min-width: 768px) 768px, 100vw"
      className={cn('rounded-xl outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10', className)}
      {...props}
    />
  );
}
