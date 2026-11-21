import { GitHubIcon, GoogleIcon, ProviderButton, ProviderButtonGroup } from '@/registry/kosmos/ui/provider-button';

export default function ProviderButtonHorizontal() {
  return (
    <ProviderButtonGroup orientation="horizontal" className="w-full max-w-sm">
      <ProviderButton name="Google" icon={<GoogleIcon />} lastUsed />
      <ProviderButton name="GitHub" icon={<GitHubIcon />} />
    </ProviderButtonGroup>
  );
}
