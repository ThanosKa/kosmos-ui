import { GitHubIcon, GoogleIcon, ProviderButton, ProviderButtonGroup } from '@/registry/kosmos/ui/provider-button';

export default function ProviderButtonDemo() {
  return (
    <ProviderButtonGroup className="w-full max-w-xs">
      <ProviderButton name="Google" icon={<GoogleIcon />} lastUsed />
      <ProviderButton name="GitHub" icon={<GitHubIcon />} />
    </ProviderButtonGroup>
  );
}
