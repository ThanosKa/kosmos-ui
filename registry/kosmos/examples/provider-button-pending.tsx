'use client';

import * as React from 'react';
import { GitHubIcon, GoogleIcon, ProviderButton, ProviderButtonGroup } from '@/registry/kosmos/ui/provider-button';

const providers = [
  { id: 'google', name: 'Google', icon: <GoogleIcon /> },
  { id: 'github', name: 'GitHub', icon: <GitHubIcon /> },
];

export default function ProviderButtonPending() {
  const [pending, setPending] = React.useState<string | null>(null);

  async function open(id: string) {
    setPending(id);
    // Stands in for the redirect to the provider's page.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPending(null);
  }

  return (
    <ProviderButtonGroup className="w-full max-w-xs">
      {providers.map((provider) => (
        <ProviderButton
          key={provider.id}
          name={provider.name}
          icon={provider.icon}
          pending={pending === provider.id}
          disabled={pending !== null}
          onClick={() => open(provider.id)}
        />
      ))}
    </ProviderButtonGroup>
  );
}
