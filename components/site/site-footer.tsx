import { author, githubUrl, licenseUrl } from '@/lib/shared';
import { Button } from '@/registry/kosmos/ui/button';
import { GitHubIcon, XIcon } from './brand-icons';

const link =
  'rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-[text-decoration-color] hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** Who built Kosmos UI, where the code lives and its license. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-small text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <p>
            Built by{' '}
            <a href={author.xUrl} className={link}>
              {author.name}
            </a>
          </p>
          <div className="flex items-center">
            <Button variant="ghost" size="icon-sm" href={author.xUrl} aria-label={`${author.name} on X`}>
              <XIcon className="size-3" />
            </Button>
            <Button variant="ghost" size="icon-sm" href={author.githubUrl} aria-label={`${author.name} on GitHub`}>
              <GitHubIcon className="size-3.5" />
            </Button>
          </div>
        </div>
        <p>
          <a href={githubUrl} className={link}>
            Source code on GitHub
          </a>
          <span aria-hidden className="mx-2">
            ·
          </span>
          <a href={licenseUrl} className={link}>
            MIT License
          </a>
        </p>
      </div>
    </footer>
  );
}
