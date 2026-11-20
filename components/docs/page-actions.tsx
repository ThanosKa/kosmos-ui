'use client';

import { useSyncExternalStore } from 'react';
import { ArrowUpRight, Check, ChevronDown, Copy, FileText } from 'lucide-react';
import { ClaudeIcon, GitHubIcon, OpenAIIcon } from '@/components/site/brand-icons';
import { Button } from '@/registry/kosmos/ui/button';
import { iconSwapClass } from './classes';
import { copyAnnouncement, useDocsCopy } from './use-docs-copy';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';

const subscribeToNothing = () => () => {};

/** The site origin, so prompts for AI chats carry an absolute Markdown URL. Empty on the server. */
function useOrigin() {
  return useSyncExternalStore(subscribeToNothing, () => window.location.origin, () => '');
}

async function fetchMarkdown(markdownUrl: string) {
  const response = await fetch(markdownUrl);
  if (!response.ok) throw new Error(`Failed to fetch ${markdownUrl}: ${response.status}`);
  return response.text();
}

/**
 * The "Copy page" menu beside a docs page title: copy or view the page as Markdown, hand it to an AI chat,
 * or read its source on GitHub.
 */
export function PageActions({ markdownUrl, githubUrl }: { markdownUrl: string; githubUrl: string }) {
  const origin = useOrigin();
  const { status, copied, copy } = useDocsCopy();
  const prompt = encodeURIComponent(`Read ${origin}${markdownUrl}, I want to ask questions about it.`);
  const external = { target: '_blank', rel: 'noreferrer noopener' };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="secondary" size="md" />}>
          <span aria-hidden className="grid *:col-start-1 *:row-start-1">
            <Check data-visible={copied || undefined} className={iconSwapClass} />
            <Copy data-visible={!copied || undefined} className={iconSwapClass} />
          </span>
          Copy page
          <ChevronDown aria-hidden className="-me-0.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem onClick={() => copy(() => fetchMarkdown(markdownUrl))}>
            <Copy aria-hidden />
            Copy Markdown
          </DropdownMenuItem>
          <DropdownMenuLinkItem href={markdownUrl}>
            <FileText aria-hidden />
            View as Markdown
          </DropdownMenuLinkItem>
          <DropdownMenuSeparator />
          <DropdownMenuLinkItem href={`https://claude.ai/new?q=${prompt}`} {...external}>
            <ClaudeIcon />
            Open in Claude
            <span className="sr-only">(opens in a new tab)</span>
            <ArrowUpRight aria-hidden className="ms-auto" />
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem href={`https://chatgpt.com/?prompt=${prompt}`} {...external}>
            <OpenAIIcon />
            Open in ChatGPT
            <span className="sr-only">(opens in a new tab)</span>
            <ArrowUpRight aria-hidden className="ms-auto" />
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem href={githubUrl} {...external}>
            <GitHubIcon />
            View source on GitHub
            <span className="sr-only">(opens in a new tab)</span>
            <ArrowUpRight aria-hidden className="ms-auto" />
          </DropdownMenuLinkItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span role="status" className="sr-only">
        {copyAnnouncement(status, 'Markdown copied')}
      </span>
    </>
  );
}
