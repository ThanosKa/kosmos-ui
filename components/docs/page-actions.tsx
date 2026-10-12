'use client';

import { useSyncExternalStore } from 'react';
import { ArrowUpRight, Check, ChevronDown, Copy, FileText, MessageCircle } from 'lucide-react';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { GitHubIcon } from '@/components/site/brand-icons';
import { Button } from '@/registry/kosmos/ui/button';
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

async function copyMarkdown(markdownUrl: string) {
  const markdown = fetch(markdownUrl).then(async (response) => {
    if (!response.ok) throw new Error(`Failed to fetch ${markdownUrl}: ${response.status}`);
    return new Blob([await response.text()], { type: 'text/plain' });
  });
  // Safari only allows clipboard writes started in the click, so the fetch goes in as a promise.
  await navigator.clipboard.write([new ClipboardItem({ 'text/plain': markdown })]);
}

/**
 * The "Copy page" menu beside a docs page title: copy or view the page as Markdown, hand it to an AI chat,
 * or read its source on GitHub.
 */
export function PageActions({ markdownUrl, githubUrl }: { markdownUrl: string; githubUrl: string }) {
  const origin = useOrigin();
  const [copied, onCopy] = useCopyButton(() => copyMarkdown(markdownUrl));
  const prompt = encodeURIComponent(`Read ${origin}${markdownUrl}, I want to ask questions about it.`);
  const external = { target: '_blank', rel: 'noreferrer noopener' };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="secondary" size="md" />}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          Copy page
          <ChevronDown aria-hidden className="-me-0.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem onClick={onCopy}>
            <Copy aria-hidden />
            Copy Markdown
          </DropdownMenuItem>
          <DropdownMenuLinkItem href={markdownUrl}>
            <FileText aria-hidden />
            View as Markdown
          </DropdownMenuLinkItem>
          <DropdownMenuSeparator />
          <DropdownMenuLinkItem href={`https://claude.ai/new?q=${prompt}`} {...external}>
            <MessageCircle aria-hidden />
            Open in Claude
            <ArrowUpRight aria-hidden className="ms-auto" />
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem href={`https://chatgpt.com/?prompt=${prompt}`} {...external}>
            <MessageCircle aria-hidden />
            Open in ChatGPT
            <ArrowUpRight aria-hidden className="ms-auto" />
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem href={githubUrl} {...external}>
            <GitHubIcon />
            View source on GitHub
            <ArrowUpRight aria-hidden className="ms-auto" />
          </DropdownMenuLinkItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span role="status" className="sr-only">
        {copied ? 'Markdown copied' : ''}
      </span>
    </>
  );
}
