'use client';

import { CircleAlert, CircleCheck, Eye, LoaderCircle, MailCheck } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';
import { OtpField } from '@/registry/kosmos/ui/otp-field';

/** The screens of the flow. `email-code` asks for the code sent to confirm a new account's email. */
type AuthView = 'log-in' | 'sign-up' | 'email-code' | 'forgot-password';

/** Where the links of the forms point. Inside `AuthForms`, links to another view switch it in place. */
type AuthLinks = {
  'log-in': string;
  'sign-up': string;
  'forgot-password': string;
  terms: string;
  privacy: string;
  /** Where Continue goes once someone is logged in or verified. */
  continue: string;
};

type LogInValues = { email: string; password: string };
type SignUpValues = { name: string; email: string; password: string };

// Sample data: replace it with your product's name, your routes and calls to your auth server.
const sampleProductName = 'Parallax';
const sampleEmailPlaceholder = 'name@parallax.example';
/** The address the email code went to, when none is passed. */
const sampleEmail = 'lena@parallax.example';
const sampleLinks: AuthLinks = {
  'log-in': '/log-in',
  'sign-up': '/sign-up',
  'forgot-password': '/forgot-password',
  terms: '/terms',
  privacy: '/privacy',
  continue: '/',
};

/** Stands in for a call to your auth server, which takes a moment and succeeds. */
function sampleRequest(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 800));
}

const minPasswordLength = 8;

/** Seconds as m:ss, such as 0:30. */
function formatWait(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailError(email: string) {
  if (email.trim() === '') return 'Enter your email address.';
  if (!emailPattern.test(email.trim())) return 'Enter a full email address, like name@example.com.';
  return null;
}

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const set = (next: T) => {
    if (value === undefined) setUncontrolled(next);
    onChange?.(next);
  };
  return [value ?? uncontrolled, set] as const;
}

/** Runs a submit handler, with its pending state and the message of the error it throws. */
function useSubmit(pendingProp: boolean, defaultError: string | undefined) {
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(defaultError ?? null);
  async function run(task: () => Promise<void> | void) {
    setRunning(true);
    setError(null);
    try {
      await task();
      return true;
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : "That didn’t go through. Check your connection and try again.");
      return false;
    } finally {
      setRunning(false);
    }
  }
  return { pending: pendingProp || running, error, setError, run };
}

/** Moves focus to the element once `when` turns true after the first render, such as a heading that replaces the form. */
function useFocusWhen<T extends HTMLElement>(when: boolean) {
  const ref = React.useRef<T>(null);
  const wasTrue = React.useRef(when);
  React.useEffect(() => {
    if (when && !wasTrue.current) ref.current?.focus();
    wasTrue.current = when;
  }, [when]);
  return ref;
}

/** What every form takes. */
type AuthFormProps = {
  /** Names the product in the titles and in the mark. */
  productName?: string;
  /** Replaces the mark above the title, usually with your logo. */
  logo?: React.ReactNode;
  /** Where the links point. */
  links?: Partial<AuthLinks>;
  /** Called with the view a link leads to. With it, those links switch the view instead of navigating, as in `AuthForms`. */
  onViewChange?: (view: AuthView) => void;
  /** The level of the title. Lower it when the page already has an `<h1>`. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Moves focus to the first field when the form appears. */
  autoFocus?: boolean;
  /** Shows the form as waiting for the server. For previews; the form sets it itself while its handler runs. */
  pending?: boolean;
  /** An error to show from the start, as after a failed request. For previews. */
  defaultError?: string;
  /** Shows the validation errors from the start, as after a submit. For previews. */
  defaultSubmitted?: boolean;
  className?: string;
};

/** The email field, which `AuthForms` shares between views so it stays filled in. */
type AuthEmailProps = {
  /** The email address. Use with `onEmailChange`. */
  email?: string;
  /** The email address at first, when the form keeps its own state. */
  defaultEmail?: string;
  onEmailChange?: (email: string) => void;
  /** An example address in the empty email field. */
  emailPlaceholder?: string;
};

type ShellProps = Pick<AuthFormProps, 'productName' | 'logo' | 'headingLevel' | 'className'> & {
  title: React.ReactNode;
  description: React.ReactNode;
  headingRef?: React.Ref<HTMLHeadingElement>;
  footer?: React.ReactNode;
  children?: React.ReactNode;
};

function ProductMark({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex size-9 items-center justify-center rounded-xl border border-transparent bg-primary text-title text-primary-foreground shadow-primary"
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function StatusMark({ icon: Icon, tone }: { icon: typeof CircleCheck; tone: 'success' | 'neutral' }) {
  return (
    <span aria-hidden className="flex size-9 items-center justify-center rounded-full border border-transparent bg-muted shadow-inset">
      <Icon className={cn('size-4', tone === 'success' ? 'text-success' : 'text-foreground')} />
    </span>
  );
}

/** The card every view sits in: the mark, the title and its description, the form, and a line under the card. */
function AuthShell({
  productName = sampleProductName,
  logo,
  headingLevel = 1,
  className,
  title,
  description,
  headingRef,
  footer,
  children,
}: ShellProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div data-slot="auth-form" className={cn('@container/auth flex w-full flex-col items-center gap-5', className)}>
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-transparent bg-card p-6 shadow-card @sm/auth:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          {logo ?? <ProductMark name={productName} />}
          <div className="flex flex-col gap-1">
            {/* Focused by script only, when it replaces the form, so it needs no focus outline. */}
            <Heading ref={headingRef} tabIndex={-1} className="text-heading text-balance text-foreground outline-none">
              {title}
            </Heading>
            <p className="text-body text-pretty text-muted-foreground">{description}</p>
          </div>
        </div>
        {children}
      </div>
      {footer ? <p className="max-w-sm text-center text-small text-muted-foreground">{footer}</p> : null}
    </div>
  );
}

const linkClass =
  'rounded-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-[text-decoration-color] hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

function AuthLink({
  href,
  view,
  onViewChange,
  className,
  children,
}: {
  href: string;
  view?: AuthView;
  onViewChange?: (view: AuthView) => void;
  className?: string;
  children: React.ReactNode;
}) {
  function navigate(event: React.MouseEvent<HTMLAnchorElement>) {
    // A modified click keeps the browser's own behavior, such as opening the page in a new tab.
    if (!view || !onViewChange || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onViewChange(view);
  }
  return (
    <a href={href} onClick={navigate} className={cn(linkClass, className)}>
      {children}
    </a>
  );
}

/** An error from the server, above the fields. */
function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-small text-foreground">
      <CircleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0 text-destructive" />
      <p className="min-w-0">{children}</p>
    </div>
  );
}

/** Other ways in above the form, such as single sign-on, split from it by an "or" line. */
function Alternatives({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">{children}</div>
      <div className="flex items-center gap-3 text-caption text-muted-foreground">
        <span aria-hidden className="flex-1 border-t border-border" />
        or
        <span aria-hidden className="flex-1 border-t border-border" />
      </div>
    </div>
  );
}

function SubmitButton({ pending, pendingLabel, children }: { pending: boolean; pendingLabel: string; children: React.ReactNode }) {
  return (
    <Button type="submit" variant="primary" size="lg" className="w-full" aria-disabled={pending || undefined}>
      {pending ? (
        <>
          <LoaderCircle aria-hidden data-icon="inline-start" className="motion-safe:animate-spin motion-reduce:animate-pulse" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type'>;

/** A password input with a button that shows what was typed. */
function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('pe-10', className)} {...props} />
      <div className="absolute inset-y-0 end-1.5 flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Show password"
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
          className="aria-pressed:bg-accent"
        >
          <Eye aria-hidden />
        </Button>
      </div>
    </div>
  );
}

type LogInFormProps = AuthFormProps &
  AuthEmailProps & {
    /** Logs in. Throw an `Error` to show its message above the fields, such as a wrong password. */
    onLogIn?: (values: LogInValues) => Promise<void> | void;
    /** Other ways in, such as single sign-on buttons, shown above the form with an "or" line under them. */
    alternatives?: React.ReactNode;
    /** Shows the logged-in state from the start. For previews. */
    defaultSuccess?: boolean;
  };

/** Email and password, with links to reset the password and to sign up. Shows a logged-in state when `onLogIn` succeeds. */
function LogInForm({
  productName = sampleProductName,
  logo,
  links: linksProp,
  onViewChange,
  headingLevel,
  autoFocus,
  pending: pendingProp = false,
  defaultError,
  defaultSubmitted = false,
  className,
  email: emailProp,
  defaultEmail = '',
  onEmailChange,
  emailPlaceholder = sampleEmailPlaceholder,
  onLogIn = sampleRequest,
  alternatives,
  defaultSuccess = false,
}: LogInFormProps) {
  const links = { ...sampleLinks, ...linksProp };
  const [email, setEmail] = useControllable(emailProp, defaultEmail, onEmailChange);
  const [password, setPassword] = React.useState('');
  const [submitted, setSubmitted] = React.useState(defaultSubmitted);
  const [success, setSuccess] = React.useState(defaultSuccess);
  const { pending, error, run } = useSubmit(pendingProp, defaultError);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const successRef = useFocusWhen<HTMLHeadingElement>(success);
  const errors = { email: emailError(email), password: password === '' ? 'Enter your password.' : null };
  const shell = { productName, logo, headingLevel, className };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setSubmitted(true);
    if (errors.email) return emailRef.current?.focus();
    if (errors.password) return passwordRef.current?.focus();
    if (await run(() => onLogIn({ email: email.trim(), password }))) setSuccess(true);
  }

  if (success) {
    return (
      <AuthShell
        {...shell}
        logo={<StatusMark icon={CircleCheck} tone="success" />}
        headingRef={successRef}
        title="You’re logged in"
        description={
          <>
            Welcome back. You’re logged in as{' '}
            <span className="wrap-anywhere">
              <span className="font-medium text-foreground">{email.trim()}</span>.
            </span>
          </>
        }
      >
        <Button variant="primary" size="lg" href={links.continue} className="w-full">
          Continue to {productName}
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      {...shell}
      title={`Log in to ${productName}`}
      description="Welcome back. Enter your email and password."
      footer={
        <>
          New to {productName}?{' '}
          <AuthLink href={links['sign-up']} view="sign-up" onViewChange={onViewChange}>
            Create an account
          </AuthLink>
        </>
      }
    >
      {alternatives ? <Alternatives>{alternatives}</Alternatives> : null}
      <form noValidate onSubmit={submit} aria-busy={pending || undefined} className="flex flex-col gap-4">
        {error ? <FormAlert>{error}</FormAlert> : null}
        <Field invalid={submitted && errors.email !== null}>
          <FieldLabel>Email</FieldLabel>
          <Input
            ref={emailRef}
            type="email"
            name="email"
            autoComplete="email"
            placeholder={emailPlaceholder}
            autoFocus={autoFocus}
            readOnly={pending}
            value={email}
            onValueChange={setEmail}
          />
          <FieldError>{errors.email}</FieldError>
        </Field>
        {/* The link sits in the label row but comes after the input in the DOM, so Tab goes from the email to the password. */}
        <Field invalid={submitted && errors.password !== null} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline">
          <FieldLabel className="col-start-1 row-start-1">Password</FieldLabel>
          <div className="col-span-2 row-start-2">
            <PasswordInput
              ref={passwordRef}
              name="password"
              autoComplete="current-password"
              readOnly={pending}
              value={password}
              onValueChange={setPassword}
            />
          </div>
          <FieldError className="col-span-2 row-start-3">{errors.password}</FieldError>
          <span className="col-start-2 row-start-1 text-small">
            <AuthLink href={links['forgot-password']} view="forgot-password" onViewChange={onViewChange}>
              Forgot password?
            </AuthLink>
          </span>
        </Field>
        <SubmitButton pending={pending} pendingLabel="Logging in…">
          Log in
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

type SignUpFormProps = AuthFormProps &
  AuthEmailProps & {
    /** Creates the account and sends the email code. Throw an `Error` to show its message, such as an email already in use. */
    onSignUp?: (values: SignUpValues) => Promise<void> | void;
    /** Other ways in, such as single sign-on buttons, shown above the form with an "or" line under them. */
    alternatives?: React.ReactNode;
    /** Shown under the button. Defaults to a line that links your terms and privacy policy. */
    legal?: React.ReactNode;
  };

/**
 * Name, email and a password of at least 8 characters, with your terms under the button. When
 * `onSignUp` succeeds it calls `onViewChange('email-code')`, so the next step asks for the code.
 */
function SignUpForm({
  productName = sampleProductName,
  logo,
  links: linksProp,
  onViewChange,
  headingLevel,
  autoFocus,
  pending: pendingProp = false,
  defaultError,
  defaultSubmitted = false,
  className,
  email: emailProp,
  defaultEmail = '',
  onEmailChange,
  emailPlaceholder = sampleEmailPlaceholder,
  onSignUp = sampleRequest,
  alternatives,
  legal,
}: SignUpFormProps) {
  const links = { ...sampleLinks, ...linksProp };
  const [name, setName] = React.useState('');
  const [email, setEmail] = useControllable(emailProp, defaultEmail, onEmailChange);
  const [password, setPassword] = React.useState('');
  const [submitted, setSubmitted] = React.useState(defaultSubmitted);
  const { pending, error, run } = useSubmit(pendingProp, defaultError);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const errors = {
    name: name.trim() === '' ? 'Enter your name.' : null,
    email: emailError(email),
    password: password.length < minPasswordLength ? `Use at least ${minPasswordLength} characters.` : null,
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setSubmitted(true);
    if (errors.name) return nameRef.current?.focus();
    if (errors.email) return emailRef.current?.focus();
    if (errors.password) return passwordRef.current?.focus();
    if (await run(() => onSignUp({ name: name.trim(), email: email.trim(), password }))) onViewChange?.('email-code');
  }

  return (
    <AuthShell
      {...{ productName, logo, headingLevel, className }}
      title={`Create your ${productName} account`}
      description="Start with the Free plan. No card needed."
      footer={
        <>
          Already have an account?{' '}
          <AuthLink href={links['log-in']} view="log-in" onViewChange={onViewChange}>
            Log in
          </AuthLink>
        </>
      }
    >
      {alternatives ? <Alternatives>{alternatives}</Alternatives> : null}
      <form noValidate onSubmit={submit} aria-busy={pending || undefined} className="flex flex-col gap-4">
        {error ? <FormAlert>{error}</FormAlert> : null}
        <Field invalid={submitted && errors.name !== null}>
          <FieldLabel>Name</FieldLabel>
          <Input
            ref={nameRef}
            name="name"
            autoComplete="name"
            autoFocus={autoFocus}
            readOnly={pending}
            value={name}
            onValueChange={setName}
          />
          <FieldError>{errors.name}</FieldError>
        </Field>
        <Field invalid={submitted && errors.email !== null}>
          <FieldLabel>Email</FieldLabel>
          <Input
            ref={emailRef}
            type="email"
            name="email"
            autoComplete="email"
            placeholder={emailPlaceholder}
            readOnly={pending}
            value={email}
            onValueChange={setEmail}
          />
          <FieldError>{errors.email}</FieldError>
        </Field>
        <Field invalid={submitted && errors.password !== null}>
          <FieldLabel>Password</FieldLabel>
          <PasswordInput
            ref={passwordRef}
            name="password"
            autoComplete="new-password"
            minLength={minPasswordLength}
            readOnly={pending}
            value={password}
            onValueChange={setPassword}
          />
          {submitted && errors.password ? (
            <FieldError>{errors.password}</FieldError>
          ) : (
            <FieldDescription>At least {minPasswordLength} characters.</FieldDescription>
          )}
        </Field>
        <SubmitButton pending={pending} pendingLabel="Creating account…">
          Create account
        </SubmitButton>
        <p className="text-center text-caption text-pretty text-muted-foreground">
          {legal ?? (
            <>
              By creating an account, you agree to the{' '}
              <a href={links.terms} className={linkClass}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href={links.privacy} className={linkClass}>
                Privacy Policy
              </a>
              .
            </>
          )}
        </p>
      </form>
    </AuthShell>
  );
}

type EmailCodeFormProps = AuthFormProps & {
  /** The address the code went to. */
  email?: string;
  /** The number of characters in the code. */
  length?: number;
  /** Checks the code. Throw an `Error` to show its message under the code, such as a wrong or expired code. */
  onVerify?: (code: string, email: string) => Promise<void> | void;
  /** Sends a new code. */
  onResendCode?: (email: string) => Promise<void> | void;
  /** Seconds to wait before a new code can be sent. The wait starts when the form appears and after each resend. */
  resendAfter?: number;
  /** Where "Use a different email" leads. */
  backView?: AuthView;
  /** The code typed so far. Use with `onCodeChange`. */
  code?: string;
  /** The code at first, when the form keeps its own state. */
  defaultCode?: string;
  onCodeChange?: (code: string) => void;
  /** Shows the verified state from the start. For previews. */
  defaultSuccess?: boolean;
};

/**
 * The code sent to confirm an email address, one character per box. The form submits itself
 * when the last box is filled. A new code can be sent once `resendAfter` seconds have passed.
 */
function EmailCodeForm({
  productName = sampleProductName,
  logo,
  links: linksProp,
  onViewChange,
  headingLevel,
  autoFocus,
  pending: pendingProp = false,
  defaultError,
  defaultSubmitted = false,
  className,
  email = sampleEmail,
  length = 6,
  onVerify = sampleRequest,
  onResendCode = sampleRequest,
  resendAfter = 30,
  backView = 'sign-up',
  code: codeProp,
  defaultCode = '',
  onCodeChange,
  defaultSuccess = false,
}: EmailCodeFormProps) {
  const links = { ...sampleLinks, ...linksProp };
  const codeRef = React.useRef<HTMLDivElement>(null);
  const focusCode = () => codeRef.current?.querySelector('input')?.focus();
  const [code, setCode] = useControllable(codeProp, defaultCode, onCodeChange);
  const [submitted, setSubmitted] = React.useState(defaultSubmitted);
  const [success, setSuccess] = React.useState(defaultSuccess);
  const [wait, setWait] = React.useState(resendAfter);
  const [resending, setResending] = React.useState(false);
  const [resent, setResent] = React.useState(false);
  const { pending, error, setError, run } = useSubmit(pendingProp, defaultError);
  const successRef = useFocusWhen<HTMLHeadingElement>(success);
  const incomplete = code.length < length ? `Enter all ${length} digits of the code.` : null;
  const codeError = (submitted ? incomplete : null) ?? error;
  const shell = { productName, logo, headingLevel, className };

  React.useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  React.useEffect(() => {
    if (autoFocus) codeRef.current?.querySelector('input')?.focus();
  }, [autoFocus]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setSubmitted(true);
    if (incomplete) return focusCode();
    if (await run(() => onVerify(code, email))) setSuccess(true);
    else focusCode();
  }

  async function resend() {
    if (wait > 0 || resending) return;
    setResending(true);
    setResent(false);
    try {
      await onResendCode(email);
      setResent(true);
      setError(null);
      setWait(resendAfter);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : "We couldn’t send a new code. Check your connection and try again.");
    } finally {
      setResending(false);
    }
  }

  if (success) {
    return (
      <AuthShell
        {...shell}
        logo={<StatusMark icon={CircleCheck} tone="success" />}
        headingRef={successRef}
        title="Email confirmed"
        description={
          <>
            <span className="font-medium wrap-anywhere text-foreground">{email}</span> is confirmed. Your account is ready.
          </>
        }
      >
        <Button variant="primary" size="lg" href={links.continue} className="w-full">
          Continue to {productName}
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      {...shell}
      logo={<StatusMark icon={MailCheck} tone="neutral" />}
      title="Check your email"
      description={
        <>
          Enter the {length}-digit code we sent to{' '}
          <span className="wrap-anywhere">
            <span className="font-medium text-foreground">{email}</span>.
          </span>
        </>
      }
      footer={
        <>
          Wrong address?{' '}
          <AuthLink href={links[backView === 'email-code' ? 'sign-up' : backView]} view={backView} onViewChange={onViewChange}>
            Use a different email
          </AuthLink>
        </>
      }
    >
      <form noValidate onSubmit={submit} aria-busy={pending || undefined} className="flex flex-col gap-4">
        <Field invalid={codeError !== null} className="items-center">
          <FieldLabel className="sr-only">Code</FieldLabel>
          <OtpField
            ref={codeRef}
            name="code"
            length={length}
            autoSubmit
            readOnly={pending}
            value={code}
            onValueChange={(value) => {
              setCode(value);
              setError(null);
            }}
          />
          <FieldError>{codeError}</FieldError>
        </Field>
        <SubmitButton pending={pending} pendingLabel="Confirming…">
          Confirm email
        </SubmitButton>
        <div className="flex flex-wrap items-center justify-center gap-x-1 text-small text-muted-foreground">
          <span>Didn’t get the email?</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={wait > 0 || resending}
            focusableWhenDisabled
            onClick={resend}
            className="tabular-nums"
          >
            {resending ? 'Sending…' : wait > 0 ? `Send a new code in ${formatWait(wait)}` : 'Send a new code'}
          </Button>
        </div>
        <p role="status" className="text-center text-small text-muted-foreground empty:sr-only">
          {resent ? `We sent a new code to ${email}.` : null}
        </p>
      </form>
    </AuthShell>
  );
}

type ForgotPasswordFormProps = AuthFormProps &
  AuthEmailProps & {
    /** Sends the reset link. It resolves whether or not an account uses the address, so the form never tells who has one. */
    onResetPassword?: (email: string) => Promise<void> | void;
    /** Shows the "Check your email" state from the start. For previews. */
    defaultSent?: boolean;
  };

/** Asks for the email address and sends a link to reset the password, then says to check the inbox. */
function ForgotPasswordForm({
  productName = sampleProductName,
  logo,
  links: linksProp,
  onViewChange,
  headingLevel,
  autoFocus,
  pending: pendingProp = false,
  defaultError,
  defaultSubmitted = false,
  className,
  email: emailProp,
  defaultEmail = '',
  onEmailChange,
  emailPlaceholder = sampleEmailPlaceholder,
  onResetPassword = sampleRequest,
  defaultSent = false,
}: ForgotPasswordFormProps) {
  const links = { ...sampleLinks, ...linksProp };
  const [email, setEmail] = useControllable(emailProp, defaultEmail, onEmailChange);
  const [submitted, setSubmitted] = React.useState(defaultSubmitted);
  const [sent, setSent] = React.useState(defaultSent);
  const { pending, error, run } = useSubmit(pendingProp, defaultError);
  // Back from "Check your email", focus returns to the email field.
  const emailRef = useFocusWhen<HTMLInputElement>(!sent);
  const sentRef = useFocusWhen<HTMLHeadingElement>(sent);
  const invalid = emailError(email);
  const shell = { productName, logo, headingLevel, className };
  const backToLogIn = (
    <AuthLink href={links['log-in']} view="log-in" onViewChange={onViewChange}>
      Back to log in
    </AuthLink>
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setSubmitted(true);
    if (invalid) return emailRef.current?.focus();
    if (await run(() => onResetPassword(email.trim()))) setSent(true);
  }

  if (sent) {
    return (
      <AuthShell
        {...shell}
        logo={<StatusMark icon={MailCheck} tone="neutral" />}
        headingRef={sentRef}
        title="Check your email"
        description={
          <>
            If an account uses <span className="font-medium wrap-anywhere text-foreground">{email.trim()}</span>, we sent it a link to reset
            the password. The link works for 1 hour.
          </>
        }
        footer={<>Remembered it? {backToLogIn}</>}
      >
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => {
            setSent(false);
            setSubmitted(false);
          }}
        >
          Use a different email
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      {...shell}
      title="Reset your password"
      description="Enter the email you log in with and we’ll send you a link to set a new password."
      footer={<>Remembered it? {backToLogIn}</>}
    >
      <form noValidate onSubmit={submit} aria-busy={pending || undefined} className="flex flex-col gap-4">
        {error ? <FormAlert>{error}</FormAlert> : null}
        <Field invalid={submitted && invalid !== null}>
          <FieldLabel>Email</FieldLabel>
          <Input
            ref={emailRef}
            type="email"
            name="email"
            autoComplete="email"
            placeholder={emailPlaceholder}
            autoFocus={autoFocus}
            readOnly={pending}
            value={email}
            onValueChange={setEmail}
          />
          <FieldError>{invalid}</FieldError>
        </Field>
        <SubmitButton pending={pending} pendingLabel="Sending link…">
          Send reset link
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

type AuthFormsProps = Omit<AuthFormProps, 'autoFocus' | 'pending' | 'defaultError' | 'defaultSubmitted'> &
  AuthEmailProps &
  Pick<LogInFormProps, 'onLogIn' | 'alternatives'> &
  Pick<SignUpFormProps, 'onSignUp' | 'legal'> &
  Pick<EmailCodeFormProps, 'onVerify' | 'onResendCode' | 'resendAfter'> &
  Pick<ForgotPasswordFormProps, 'onResetPassword'> & {
    /** The view shown. Use with `onViewChange`. */
    view?: AuthView;
    /** The view shown at first, when the forms keep their own state. */
    defaultView?: AuthView;
  };

/**
 * The whole flow in one place: log in, sign up, the email code that confirms a new account,
 * and the password reset. Links between views switch them in place, the email typed in one
 * view carries to the next, and focus moves to the first field of the new view.
 */
function AuthForms({
  view: viewProp,
  defaultView = 'log-in',
  onViewChange,
  email: emailProp,
  defaultEmail = '',
  onEmailChange,
  emailPlaceholder,
  onLogIn,
  alternatives,
  onSignUp,
  legal,
  onVerify,
  onResendCode,
  resendAfter,
  onResetPassword,
  ...shared
}: AuthFormsProps) {
  const [view, setView] = useControllable(viewProp, defaultView, onViewChange);
  const [email, setEmail] = useControllable(emailProp, defaultEmail, onEmailChange);
  // Focus moves into a view only when someone switched to it, never on the first render.
  const [switched, setSwitched] = React.useState(false);
  const props = {
    ...shared,
    autoFocus: switched,
    onViewChange: (next: AuthView) => {
      setSwitched(true);
      setView(next);
    },
  };
  const emailProps = { email, onEmailChange: setEmail, emailPlaceholder };

  if (view === 'sign-up') return <SignUpForm key={view} {...props} {...emailProps} onSignUp={onSignUp} alternatives={alternatives} legal={legal} />;
  if (view === 'email-code')
    return (
      <EmailCodeForm
        key={view}
        {...props}
        email={email.trim() || undefined}
        onVerify={onVerify}
        onResendCode={onResendCode}
        resendAfter={resendAfter}
      />
    );
  if (view === 'forgot-password') return <ForgotPasswordForm key={view} {...props} {...emailProps} onResetPassword={onResetPassword} />;
  return <LogInForm key={view} {...props} {...emailProps} onLogIn={onLogIn} alternatives={alternatives} />;
}

export {
  AuthForms,
  EmailCodeForm,
  ForgotPasswordForm,
  LogInForm,
  SignUpForm,
  type AuthFormProps,
  type AuthFormsProps,
  type AuthLinks,
  type AuthView,
  type EmailCodeFormProps,
  type ForgotPasswordFormProps,
  type LogInFormProps,
  type LogInValues,
  type SignUpFormProps,
  type SignUpValues,
};
