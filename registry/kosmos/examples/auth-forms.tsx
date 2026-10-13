'use client';

import { KeyRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { AuthForms, EmailCodeForm, ForgotPasswordForm, LogInForm, SignUpForm } from '@/registry/kosmos/blocks/auth-forms/auth-forms';
import { Button } from '@/registry/kosmos/ui/button';

const sso = (
  <Button variant="secondary" size="lg" className="w-full">
    <KeyRound aria-hidden data-icon="inline-start" />
    Continue with single sign-on
  </Button>
);

function Frame({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="font-mono text-caption text-muted-foreground">{label}</figcaption>
      <div className={`flex w-full justify-center rounded-xl border border-transparent bg-background p-4 shadow-card sm:p-8 ${className ?? ''}`}>
        {children}
      </div>
    </figure>
  );
}

const grid = 'grid gap-6 lg:grid-cols-2';

export default function AuthFormsPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Log in">
        <div className={grid}>
          <Frame label="empty">
            <LogInForm headingLevel={2} />
          </Frame>
          <Frame label="submitted empty">
            <LogInForm headingLevel={2} defaultSubmitted defaultEmail="lena@parallax" />
          </Frame>
          <Frame label="wrong password (server error)">
            <LogInForm headingLevel={2} defaultEmail="lena@parallax.example" defaultError="That email and password don’t match. Try again, or reset your password." />
          </Frame>
          <Frame label="loading">
            <LogInForm headingLevel={2} pending defaultEmail="lena@parallax.example" />
          </Frame>
          <Frame label="success">
            <LogInForm headingLevel={2} defaultSuccess defaultEmail="lena@parallax.example" />
          </Frame>
          <Frame label="with alternatives">
            <LogInForm headingLevel={2} alternatives={sso} />
          </Frame>
        </div>
      </PreviewSection>

      <PreviewSection title="Sign up">
        <div className={grid}>
          <Frame label="empty">
            <SignUpForm headingLevel={2} />
          </Frame>
          <Frame label="submitted with errors">
            <SignUpForm headingLevel={2} defaultSubmitted defaultEmail="tomas@parallax.example" />
          </Frame>
          <Frame label="email in use (server error)">
            <SignUpForm
              headingLevel={2}
              defaultEmail="ama@parallax.example"
              defaultError="An account already uses this email. Log in instead, or reset your password."
            />
          </Frame>
          <Frame label="loading">
            <SignUpForm headingLevel={2} pending defaultEmail="kai@parallax.example" />
          </Frame>
        </div>
      </PreviewSection>

      <PreviewSection title="Email code">
        <div className={grid}>
          <Frame label="empty">
            <EmailCodeForm headingLevel={2} />
          </Frame>
          <Frame label="partly filled, submitted">
            <EmailCodeForm headingLevel={2} defaultCode="424" defaultSubmitted />
          </Frame>
          <Frame label="wrong code (server error)">
            <EmailCodeForm
              headingLevel={2}
              defaultCode="424241"
              defaultError="That code is wrong or has expired. Check the latest email, or send a new code."
            />
          </Frame>
          <Frame label="loading">
            <EmailCodeForm headingLevel={2} defaultCode="424242" pending />
          </Frame>
          <Frame label="success">
            <EmailCodeForm headingLevel={2} defaultSuccess />
          </Frame>
          <Frame label="resend ready, eight characters">
            <EmailCodeForm headingLevel={2} length={8} resendAfter={0} />
          </Frame>
        </div>
      </PreviewSection>

      <PreviewSection title="Forgot password">
        <div className={grid}>
          <Frame label="empty">
            <ForgotPasswordForm headingLevel={2} />
          </Frame>
          <Frame label="submitted invalid">
            <ForgotPasswordForm headingLevel={2} defaultSubmitted defaultEmail="lena.parallax.example" />
          </Frame>
          <Frame label="loading">
            <ForgotPasswordForm headingLevel={2} pending defaultEmail="lena@parallax.example" />
          </Frame>
          <Frame label="sent">
            <ForgotPasswordForm headingLevel={2} defaultSent defaultEmail="lena@parallax.example" />
          </Frame>
        </div>
      </PreviewSection>

      <PreviewSection title="Long text and narrow container">
        <div className={grid}>
          <Frame label="long product name and email">
            <EmailCodeForm
              headingLevel={2}
              productName="Parallax Staging Environment for Scale Customers"
              email="tomas.ortega-villanueva.de-la-fuente@engineering.parallax.example"
            />
          </Frame>
          <Frame label="280px container" className="[&>*]:max-w-[280px]">
            <LogInForm headingLevel={2} productName="Parallax Staging Environment" defaultSubmitted />
          </Frame>
        </div>
      </PreviewSection>

      <PreviewSection title="Live flow (links switch views in place)">
        <Frame label="AuthForms">
          <AuthForms headingLevel={2} alternatives={sso} />
        </Frame>
      </PreviewSection>
    </PreviewStack>
  );
}
