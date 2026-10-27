'use client';

import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { CopyField } from '@/registry/kosmos/ui/copy-field';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/registry/kosmos/ui/dialog';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/registry/kosmos/ui/input-group';
import { NumberField } from '@/registry/kosmos/ui/number-field';
import { RadioCard, RadioCardDescription, RadioCardTitle, RadioGroup } from '@/registry/kosmos/ui/radio-group';
import { Switch } from '@/registry/kosmos/ui/switch';
import { Textarea } from '@/registry/kosmos/ui/textarea';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type SettingsSaveState = 'idle' | 'saving' | 'saved' | 'error';

const cardSurface = 'flex min-w-0 flex-col rounded-2xl border border-transparent bg-card text-card-foreground shadow-card';

const spinner = 'motion-safe:animate-spin motion-reduce:animate-pulse';

/**
 * The state of one settings card: the values on screen, the values last saved, and whether Save has work to do.
 * `dirty` is true while a value differs from the saved one. `save` calls `onSave` with the values; when it
 * throws, its message shows in the card and the values stay as typed.
 */
function useSettingsForm<Values extends Record<string, string | number | boolean | null>>(
  initial: Values,
  onSave?: (values: Values) => Promise<void> | void,
) {
  const [saved, setSaved] = React.useState(initial);
  const [values, setValues] = React.useState(initial);
  const [state, setState] = React.useState<SettingsSaveState>('idle');
  const [error, setError] = React.useState<string | null>(null);

  const dirty = (Object.keys(values) as (keyof Values)[]).some((key) => !Object.is(values[key], saved[key]));

  function setValue<Key extends keyof Values>(key: Key, value: Values[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setState('idle');
    setError(null);
  }

  async function save() {
    if (!dirty || state === 'saving') return;
    const next = values;
    setState('saving');
    setError(null);
    try {
      await onSave?.(next);
      setSaved(next);
      setState('saved');
    } catch (thrown) {
      setState('error');
      setError(thrown instanceof Error ? thrown.message : 'Your changes were not saved. Try again.');
    }
  }

  function reset() {
    setValues(saved);
    setState('idle');
    setError(null);
  }

  return { values, setValue, dirty, state, error, save, reset };
}

type SettingsPanelProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  /** Names the panel. */
  title: React.ReactNode;
  /** One line under the title. */
  description?: React.ReactNode;
  /** The level of the title. Lower it when the page already has other headings. */
  headingLevel?: HeadingLevel;
};

/** A card for settings with nothing to save: a title, a description and what belongs under them. */
function SettingsPanel({ title, description, headingLevel = 2, className, children, ...props }: SettingsPanelProps) {
  const titleId = React.useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section data-slot="settings-panel" aria-labelledby={titleId} className={cn(cardSurface, 'gap-4 p-5', className)} {...props}>
      <div className="flex flex-col gap-1">
        <Heading id={titleId} className="text-title text-balance">
          {title}
        </Heading>
        {description ? <p className="text-small text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

type SettingsCardProps = Omit<React.ComponentProps<'form'>, 'title' | 'onSubmit' | 'onReset'> & {
  /** Names the card, and the form for screen readers. */
  title: React.ReactNode;
  /** One line under the title that says what these settings change. */
  description?: React.ReactNode;
  /** Whether a field differs from what was saved. Save is off until it does. */
  dirty: boolean;
  /** `saving` shows the spinner and holds the fields; `saved` and `error` say how the last save went. */
  state?: SettingsSaveState;
  /** The message of a failed save. Shown while `state` is `error`. */
  error?: string | null;
  /** Called when Save is pressed, or Enter in a field. */
  onSave: () => void;
  /** Called by the Discard button, which shows while `dirty`. */
  onReset: () => void;
  /** The label of the Save button. */
  saveLabel?: string;
  /** The level of the title. Lower it when the page already has other headings. */
  headingLevel?: HeadingLevel;
};

/**
 * A card for one group of settings: a title and a description, the fields, and a footer with Save and Discard.
 * Save is off until a field changes, and the footer says whether there are unsaved changes, a save is under
 * way, the changes are saved, or saving failed.
 */
function SettingsCard({
  title,
  description,
  dirty,
  state = 'idle',
  error,
  onSave,
  onReset,
  saveLabel = 'Save changes',
  headingLevel = 2,
  className,
  children,
  ...props
}: SettingsCardProps) {
  const titleId = React.useId();
  const Heading = `h${headingLevel}` as const;
  const saving = state === 'saving';
  return (
    <form
      data-slot="settings-card"
      noValidate
      aria-labelledby={titleId}
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
      className={cn(cardSurface, className)}
      {...props}
    >
      <div className="flex flex-col gap-1 px-5 pt-5">
        <Heading id={titleId} className="text-title text-balance">
          {title}
        </Heading>
        {description ? <p className="text-small text-muted-foreground">{description}</p> : null}
      </div>
      <fieldset disabled={saving} className="flex min-w-0 flex-col gap-4 px-5 py-5">
        {children}
      </fieldset>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-5 py-3">
        {/* Stays in the page while empty, so the first message is announced. */}
        <p role="status" className="flex min-w-0 flex-1 basis-40 items-center gap-1.5 text-small text-muted-foreground">
          {state === 'error' ? (
            <>
              <CircleAlert aria-hidden className="size-3.5 shrink-0 text-destructive" />
              <span className="min-w-0 text-foreground">{error}</span>
            </>
          ) : saving ? (
            'Saving'
          ) : dirty ? (
            'Unsaved changes'
          ) : state === 'saved' ? (
            <>
              <Check aria-hidden className="size-3.5 shrink-0 text-success" />
              Changes saved
            </>
          ) : null}
        </p>
        <div className="ms-auto flex items-center gap-2">
          {dirty && !saving ? (
            <Button type="button" variant="ghost" onClick={onReset}>
              Discard
            </Button>
          ) : null}
          <Button type="submit" variant="primary" disabled={!dirty || saving}>
            {saving ? <LoaderCircle aria-hidden data-icon="inline-start" className={spinner} /> : null}
            {saving ? 'Saving' : saveLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

type SettingsSection = {
  /** The id of the section on the page, which its link points to. */
  id: string;
  label: string;
};

type SettingsNavProps = Omit<React.ComponentProps<'nav'>, 'children'> & {
  sections: SettingsSection[];
  /** The `id` of the section in view, marked as the current one. */
  current: string;
  /** Called when a link is pressed. */
  onNavigate?: (id: string) => void;
};

/** Links to the sections of a settings page. The current one takes the accent color on the hover fill. */
function SettingsNav({ sections, current, onNavigate, className, ...props }: SettingsNavProps) {
  return (
    <nav data-slot="settings-nav" aria-label="Settings" className={className} {...props}>
      <ul className="flex flex-wrap gap-1 @3xl:flex-col">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={section.id === current ? 'location' : undefined}
              onClick={() => onNavigate?.(section.id)}
              className={cn(
                'flex min-h-7.5 items-center rounded-lg px-2.5 text-body font-medium text-muted-foreground',
                'transition-[background-color,color] duration-instant hover:bg-accent hover:text-foreground',
                'aria-[current=location]:bg-accent aria-[current=location]:text-accent-text',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

type DangerAction = {
  id: string;
  /** What the action does, such as "Delete workspace". */
  title: string;
  /** What happens, and that it cannot be undone. */
  description: string;
  /** The label of the button on the row and of the one that confirms. */
  label: string;
  /** Text to type before the action can be confirmed, such as the workspace name. Without it, the dialog needs one press. */
  confirmText?: string;
  /** Called once confirmed. Throw an `Error` to show its message in the dialog. */
  onConfirm?: () => Promise<void> | void;
};

type DangerZoneProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  actions: DangerAction[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  headingLevel?: HeadingLevel;
  /** The `id` of an action whose dialog starts open. For previews. */
  defaultOpenAction?: string;
  /** The element the dialog renders into. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof DialogContent>['container'];
  /** Blocks the page behind the dialog. Defaults to `true`. */
  modal?: boolean;
};

/**
 * Actions that cannot be undone, each on a row with its own button. The button opens a dialog that says what
 * will be lost; when the action carries `confirmText`, the dialog's button stays off until it is typed exactly.
 */
function DangerZone({
  actions,
  title = 'Danger zone',
  description = 'These actions cannot be undone.',
  headingLevel = 2,
  defaultOpenAction,
  container,
  modal = true,
  className,
  ...props
}: DangerZoneProps) {
  const titleId = React.useId();
  const Heading = `h${headingLevel}` as const;
  const [openId, setOpenId] = React.useState<string | null>(defaultOpenAction ?? null);
  const action = actions.find((candidate) => candidate.id === openId);
  return (
    <section data-slot="danger-zone" aria-labelledby={titleId} className={cn(cardSurface, className)} {...props}>
      <div className="flex flex-col gap-1 px-5 pt-5 pb-4">
        <Heading id={titleId} className="text-title text-balance">
          {title}
        </Heading>
        {description ? <p className="text-small text-muted-foreground">{description}</p> : null}
      </div>
      <ul className="flex flex-col divide-y divide-border border-t border-border">
        {actions.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
            <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
              <p className="text-body font-medium">{item.title}</p>
              <p className="text-small text-muted-foreground">{item.description}</p>
            </div>
            <Button type="button" variant="destructive" onClick={() => setOpenId(item.id)}>
              {item.label}
            </Button>
          </li>
        ))}
      </ul>
      {action ? <ConfirmDialog key={action.id} action={action} container={container} modal={modal} onClose={() => setOpenId(null)} /> : null}
    </section>
  );
}

function ConfirmDialog({
  action,
  container,
  modal,
  onClose,
}: {
  action: DangerAction;
  container: DangerZoneProps['container'];
  modal: boolean;
  onClose: () => void;
}) {
  const [typed, setTyped] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const confirmed = action.confirmText === undefined || typed === action.confirmText;

  async function confirm(event: React.FormEvent) {
    event.preventDefault();
    if (!confirmed || pending) return;
    setPending(true);
    setError(null);
    try {
      await action.onConfirm?.();
      onClose();
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : 'That did not work. Try again.');
      setPending(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())} modal={modal}>
      <DialogContent container={container} initialFocus={action.confirmText === undefined ? false : undefined} className="max-w-[28rem]">
        <form noValidate onSubmit={confirm} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{action.title}</DialogTitle>
            <DialogDescription>{action.description}</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-3">
            {action.confirmText !== undefined ? (
              <Field>
                <FieldLabel>
                  Type <span className="font-mono text-foreground">{action.confirmText}</span> to confirm
                </FieldLabel>
                <Input autoComplete="off" spellCheck={false} value={typed} onValueChange={setTyped} />
              </Field>
            ) : null}
            <p role="alert" className="flex min-w-0 items-start gap-1.5 text-small text-tint-red-foreground empty:hidden">
              {error ? (
                <>
                  <CircleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  <span className="min-w-0">{error}</span>
                </>
              ) : null}
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="secondary" />}>Cancel</DialogClose>
            <Button type="submit" variant="destructive" disabled={!confirmed || pending}>
              {pending ? <LoaderCircle aria-hidden data-icon="inline-start" className={spinner} /> : null}
              {action.label}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Sample data: replace it with your account, notification topics and key.
const sections: SettingsSection[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'api', label: 'API access' },
  { id: 'danger-zone', label: 'Danger zone' },
];

type ProfileValues = { name: string; email: string; username: string; bio: string };
type NotificationValues = { product: boolean; security: boolean; digest: string; usageAlert: number };

const sampleProfile: ProfileValues = {
  name: 'Lena Park',
  email: 'lena@acme.example',
  username: 'lena',
  bio: 'Platform engineer. I look after ingestion and billing.',
};

const sampleNotifications: NotificationValues = { product: true, security: true, digest: 'weekly', usageAlert: 80 };

const sampleApiKey = 'kos_example_123456789';

/** Stands in for your server until you pass a handler: waits a moment and succeeds. */
function simulateRequest() {
  return new Promise<void>((resolve) => setTimeout(resolve, 700));
}

type SettingsPageProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The profile card's values at first. */
  profile?: ProfileValues;
  /** Saves the profile. Throw an `Error` to show its message in the card. */
  onSaveProfile?: (values: ProfileValues) => Promise<void> | void;
  /** The notifications card's values at first. */
  notifications?: NotificationValues;
  /** Saves the notification settings. Throw an `Error` to show its message in the card. */
  onSaveNotifications?: (values: NotificationValues) => Promise<void> | void;
  /** The key shown, hidden until revealed, in the API access card. */
  apiKey?: string;
  /** The name of the workspace people type to confirm deleting it. */
  workspaceName?: string;
  /** Called once deleting the workspace is confirmed. */
  onDeleteWorkspace?: () => Promise<void> | void;
  /** Called once resetting the API key is confirmed. */
  onResetApiKey?: () => Promise<void> | void;
  /** The section marked current at first. */
  defaultCurrent?: string;
  /** Props passed on to the danger zone, such as `defaultOpenAction` and `container`, for previews. */
  dangerZoneProps?: Partial<DangerZoneProps>;
  /** The level of the card titles. Lower it when the page already has other headings. */
  headingLevel?: HeadingLevel;
};

/**
 * A settings page: links to its sections beside four cards, profile, notifications, API access and a danger
 * zone. Each card saves on its own, and its Save is off until a field changes. The link of the section in view
 * is marked as current. Lays itself out by its own width: the links sit in a column from 768px, above the cards below.
 */
function SettingsPage({
  profile = sampleProfile,
  onSaveProfile,
  notifications = sampleNotifications,
  onSaveNotifications,
  apiKey = sampleApiKey,
  workspaceName = 'Acme',
  onDeleteWorkspace,
  onResetApiKey,
  defaultCurrent = 'profile',
  dangerZoneProps,
  headingLevel = 2,
  className,
  ...props
}: SettingsPageProps) {
  const profileForm = useSettingsForm(profile, onSaveProfile ?? simulateRequest);
  const notificationForm = useSettingsForm(notifications, onSaveNotifications ?? simulateRequest);
  const [current, setCurrent] = React.useState(defaultCurrent);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (first) setCurrent(first.target.id);
      },
      { rootMargin: '0px 0px -60% 0px' },
    );
    for (const section of sections) {
      const node = root.querySelector(`[id="${section.id}"]`);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, []);

  const anchored = 'scroll-mt-4';

  return (
    <div ref={rootRef} data-slot="settings-page" className={cn('@container w-full', className)} {...props}>
      <div className="flex flex-col gap-6 @3xl:flex-row @3xl:items-start @3xl:gap-8">
        <SettingsNav sections={sections} current={current} onNavigate={setCurrent} className="@3xl:sticky @3xl:top-4 @3xl:w-44 @3xl:shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <SettingsCard
            id="profile"
            className={anchored}
            headingLevel={headingLevel}
            title="Profile"
            description="How you appear to the rest of the workspace."
            dirty={profileForm.dirty}
            state={profileForm.state}
            error={profileForm.error}
            onSave={profileForm.save}
            onReset={profileForm.reset}
          >
            <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input autoComplete="name" value={profileForm.values.name} onValueChange={(value) => profileForm.setValue('name', value)} />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  autoComplete="email"
                  value={profileForm.values.email}
                  onValueChange={(value) => profileForm.setValue('email', value)}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>Username</FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>acme.example/</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  autoComplete="username"
                  spellCheck={false}
                  value={profileForm.values.username}
                  onValueChange={(value) => profileForm.setValue('username', value)}
                />
              </InputGroup>
              <FieldDescription>Your profile address. Changing it breaks links people saved.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Bio</FieldLabel>
              <Textarea value={profileForm.values.bio} onValueChange={(value) => profileForm.setValue('bio', String(value))} />
            </Field>
          </SettingsCard>

          <SettingsCard
            id="notifications"
            className={anchored}
            headingLevel={headingLevel}
            title="Notifications"
            description="Choose what reaches your inbox."
            dirty={notificationForm.dirty}
            state={notificationForm.state}
            error={notificationForm.error}
            onSave={notificationForm.save}
            onReset={notificationForm.reset}
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel>Product updates</FieldLabel>
                <FieldDescription>New features and changes to how things work.</FieldDescription>
              </FieldContent>
              <Switch checked={notificationForm.values.product} onCheckedChange={(checked) => notificationForm.setValue('product', checked)} />
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel>Security alerts</FieldLabel>
                <FieldDescription>New sign-ins and changes to your keys.</FieldDescription>
              </FieldContent>
              <Switch checked={notificationForm.values.security} onCheckedChange={(checked) => notificationForm.setValue('security', checked)} />
            </Field>
            <Field>
              <FieldLabel nativeLabel={false} render={<div />}>
                Activity digest
              </FieldLabel>
              <RadioGroup
                value={notificationForm.values.digest}
                onValueChange={(value) => notificationForm.setValue('digest', value)}
                className="grid-cols-1 gap-2 @xl:grid-cols-2"
              >
                <RadioCard value="daily">
                  <RadioCardTitle>Daily</RadioCardTitle>
                  <RadioCardDescription>One email each morning.</RadioCardDescription>
                </RadioCard>
                <RadioCard value="weekly">
                  <RadioCardTitle>Weekly</RadioCardTitle>
                  <RadioCardDescription>One email each Monday.</RadioCardDescription>
                </RadioCard>
              </RadioGroup>
            </Field>
            <Field>
              <FieldLabel>Usage alert</FieldLabel>
              <NumberField
                min={50}
                max={100}
                step={5}
                format={{ style: 'unit', unit: 'percent' }}
                value={notificationForm.values.usageAlert}
                onValueChange={(value) => notificationForm.setValue('usageAlert', value ?? notificationForm.values.usageAlert)}
              />
              <FieldDescription>Email me when usage passes this share of the plan.</FieldDescription>
            </Field>
          </SettingsCard>

          <SettingsPanel
            id="api"
            className={anchored}
            headingLevel={headingLevel}
            title="API access"
            description="Use this key to call the API from your servers. Keep it out of your code."
          >
            <CopyField secret label="API key" value={apiKey} />
          </SettingsPanel>

          <DangerZone
            id="danger-zone"
            className={anchored}
            headingLevel={headingLevel}
            actions={[
              {
                id: 'reset-key',
                title: 'Reset API key',
                description: 'The current key stops working at once, so update your servers first.',
                label: 'Reset key',
                onConfirm: onResetApiKey ?? simulateRequest,
              },
              {
                id: 'delete-workspace',
                title: 'Delete workspace',
                description: 'Removes every project, member and key. This cannot be undone.',
                label: 'Delete workspace',
                confirmText: workspaceName,
                onConfirm: onDeleteWorkspace ?? simulateRequest,
              },
            ]}
            {...dangerZoneProps}
          />
        </div>
      </div>
    </div>
  );
}

export {
  DangerZone,
  SettingsCard,
  SettingsNav,
  SettingsPage,
  SettingsPanel,
  useSettingsForm,
  type DangerAction,
  type DangerZoneProps,
  type NotificationValues,
  type ProfileValues,
  type SettingsCardProps,
  type SettingsNavProps,
  type SettingsPageProps,
  type SettingsPanelProps,
  type SettingsSaveState,
  type SettingsSection,
};
