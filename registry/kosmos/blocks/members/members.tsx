'use client';

import { Ellipsis, Mail, UserMinus } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { isEmail } from '@/registry/kosmos/lib/tags';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/registry/kosmos/ui/dropdown-menu';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';
import { StatusDot } from '@/registry/kosmos/ui/status';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';
import { TagsInput } from '@/registry/kosmos/ui/tags-input';

type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';
/** The roles an admin can hand out. The owner is set once and never offered. */
type AssignableRole = Exclude<MemberRole, 'owner'>;

type Member = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: MemberRole;
  /** Suspended members keep their seat but cannot sign in. */
  status?: 'active' | 'suspended';
  /** When they last used the workspace, such as "2 hours ago". */
  lastActive?: string;
};

type Invite = {
  id: string;
  email: string;
  role: AssignableRole;
  /** Who sent it and when, such as "Lena Park, Oct 9". */
  sentLabel: string;
  /** An expired invite can no longer be accepted until it is resent. */
  status?: 'pending' | 'expired';
};

// Sample data: replace it with your members. Values are made up but stable, so server and browser match.
const sampleMembers: Member[] = [
  { id: 'lena', name: 'Lena Park', email: 'lena@acme.example', role: 'owner', status: 'active', lastActive: 'Just now' },
  { id: 'tomas', name: 'Tomás Ortega', email: 'tomas@acme.example', role: 'admin', status: 'active', lastActive: '2 hours ago' },
  { id: 'kai', name: 'Kai Nakamura', email: 'kai@acme.example', role: 'member', status: 'active', lastActive: 'Yesterday' },
  { id: 'ama', name: 'Ama Mensah', email: 'ama@acme.example', role: 'member', status: 'active', lastActive: 'Oct 3' },
  { id: 'ines', name: 'Inês Carvalho', email: 'ines@acme.example', role: 'viewer', status: 'suspended', lastActive: 'Sep 12' },
];

const sampleInvites: Invite[] = [
  { id: 'invite-noor', email: 'noor@acme.example', role: 'member', sentLabel: 'Lena Park, Oct 9', status: 'pending' },
  { id: 'invite-jonas', email: 'jonas@partner.example', role: 'viewer', sentLabel: 'Tomás Ortega, Oct 6', status: 'pending' },
  { id: 'invite-yuki', email: 'yuki@acme.example', role: 'admin', sentLabel: 'Lena Park, Sep 21', status: 'expired' },
];

const sampleSuggestions = ['sofia@acme.example', 'mateo@acme.example', 'priya@acme.example'];

const roleLabels: Record<MemberRole, string> = { owner: 'Owner', admin: 'Admin', member: 'Member', viewer: 'Viewer' };
const roleHints: Record<AssignableRole, string> = {
  admin: 'manages members and billing',
  member: 'creates and edits projects',
  viewer: 'views projects only',
};
const assignableRoles = Object.keys(roleHints) as AssignableRole[];
const roleItems = assignableRoles.map((role) => ({ value: role, label: roleLabels[role] }));
const maxInvitesAtOnce = 20;

const initials = (name: string) =>
  (name.includes(' ') ? name.split(' ').map((part) => part[0]) : [name.slice(0, 2)]).join('').toUpperCase();

const countLabel = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

function RoleSelect({
  value,
  onValueChange,
  disabled,
  className,
  ...props
}: {
  value: AssignableRole;
  onValueChange: (role: AssignableRole) => void;
  disabled?: boolean;
  className?: string;
  'aria-label': string;
}) {
  return (
    <Select items={roleItems} value={value} onValueChange={(next) => next && onValueChange(next as AssignableRole)} disabled={disabled}>
      <SelectTrigger className={cn('h-7.5 w-28', className)} {...props}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {assignableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {roleLabels[role]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PersonCell({
  name,
  email,
  avatarUrl,
  you,
  avatarClassName,
}: {
  name?: string;
  email: string;
  avatarUrl?: string;
  you?: boolean;
  avatarClassName?: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar className={avatarClassName}>
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback>{name ? initials(name) : <Mail aria-hidden className="size-3.5" />}</AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-col">
        {name ? (
          <span className="flex min-w-0 items-center gap-2">
            <span title={name} className="truncate font-medium text-foreground">
              {name}
            </span>
            {you ? <Badge variant="secondary">You</Badge> : null}
          </span>
        ) : null}
        <span title={email} className={cn('truncate', name ? 'text-small text-muted-foreground' : 'font-medium text-foreground')}>
          {email}
        </span>
      </span>
    </span>
  );
}

type MembersProps = Omit<React.ComponentProps<'section'>, 'children' | 'onChange'> & {
  /** The workspace named in the invite form and the remove confirmation. */
  workspace?: string;
  /** The members to start with. The block keeps its own list from here; `onRoleChange` and `onRemove` report each change. */
  members?: Member[];
  /** The pending and expired invites to start with. */
  invites?: Invite[];
  /** The id of the signed-in member: marked "You" and kept from removing or demoting themselves. */
  currentMemberId?: string;
  /** Addresses offered while typing an invite, such as people in your directory. */
  suggestions?: string[];
  /** The role new invites start with. */
  defaultInviteRole?: AssignableRole;
  /** Called with the addresses and the role when the admin sends. The block adds them to the pending list. */
  onInvite?: (emails: string[], role: AssignableRole) => void;
  onRoleChange?: (member: Member, role: AssignableRole) => void;
  onRemove?: (member: Member) => void;
  onResend?: (invite: Invite) => void;
  onRevoke?: (invite: Invite) => void;
  /** Shows skeletons while the data loads. */
  loading?: boolean;
};

/**
 * Who is in a workspace and who is on the way: an invite form that takes many emails at once, the members with
 * their roles, and the pending invites to resend or revoke. Lays itself out by its own width, not the screen's.
 */
function Members({
  workspace = 'Acme',
  members: initialMembers = sampleMembers,
  invites: initialInvites = sampleInvites,
  currentMemberId = 'lena',
  suggestions = sampleSuggestions,
  defaultInviteRole = 'member',
  onInvite,
  onRoleChange,
  onRemove,
  onResend,
  onRevoke,
  loading = false,
  className,
  ...props
}: MembersProps) {
  const [members, setMembers] = React.useState(initialMembers);
  const [invites, setInvites] = React.useState(initialInvites);
  const [emails, setEmails] = React.useState<string[]>([]);
  const [inviteRole, setInviteRole] = React.useState<AssignableRole>(defaultInviteRole);
  const [removing, setRemoving] = React.useState<Member | null>(null);
  const [removeOpen, setRemoveOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState('');
  const inviteCount = React.useRef(0);
  const invitesRef = React.useRef<HTMLDivElement>(null);
  const membersRef = React.useRef<HTMLDivElement>(null);
  const focusAfterRemove = React.useRef<string | null>(null);
  const focusAfterRevoke = React.useRef<string | null>(null);

  React.useEffect(() => {
    const target = focusAfterRevoke.current;
    if (target === null) return;
    focusAfterRevoke.current = null;
    const button = invitesRef.current?.querySelector<HTMLElement>(`[data-invite-id="${target}"] button`);
    (button ?? invitesRef.current?.querySelector<HTMLElement>('[data-slot=invites-heading]'))?.focus();
  }, [invites]);

  const taken = React.useMemo(
    () => new Set([...members.map((member) => member.email), ...invites.map((invite) => invite.email)].map((email) => email.toLocaleLowerCase())),
    [members, invites],
  );
  const isNew = (email: string) => isEmail(email) && !taken.has(email.toLocaleLowerCase());
  const rejected = emails.filter((email) => !isNew(email));
  const taking = rejected.filter((email) => isEmail(email));
  const mistyped = rejected.filter((email) => !isEmail(email));
  const canSend = emails.length > 0 && rejected.length === 0;

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    const sent = emails.map((email) => ({
      id: `invite-new-${inviteCount.current++}`,
      email,
      role: inviteRole,
      sentLabel: 'You, just now',
      status: 'pending' as const,
    }));
    setInvites((current) => [...sent, ...current]);
    onInvite?.(emails, inviteRole);
    setConfirmation(`${countLabel(emails.length, 'invite', 'invites')} sent as ${roleLabels[inviteRole]}.`);
    setEmails([]);
  };

  const changeRole = (member: Member, role: AssignableRole) => {
    setMembers((current) => current.map((item) => (item.id === member.id ? { ...item, role } : item)));
    onRoleChange?.(member, role);
  };

  const confirmRemove = () => {
    if (!removing) return;
    const removable = members.filter((item) => item.role !== 'owner' && item.id !== currentMemberId);
    const at = removable.findIndex((item) => item.id === removing.id);
    focusAfterRemove.current = (removable[at + 1] ?? removable[at - 1])?.id ?? '';
    setMembers((current) => current.filter((item) => item.id !== removing.id));
    onRemove?.(removing);
    setConfirmation(`${removing.name} was removed from ${workspace}.`);
    setRemoveOpen(false);
  };

  const resend = (invite: Invite) => {
    setInvites((current) => current.map((item) => (item.id === invite.id ? { ...item, status: 'pending', sentLabel: 'You, just now' } : item)));
    onResend?.(invite);
    setConfirmation(`Invite to ${invite.email} sent again.`);
  };

  const revoke = (invite: Invite) => {
    const at = invites.findIndex((item) => item.id === invite.id);
    focusAfterRevoke.current = (invites[at + 1] ?? invites[at - 1])?.id ?? '';
    setInvites((current) => current.filter((item) => item.id !== invite.id));
    onRevoke?.(invite);
    setConfirmation(`Invite to ${invite.email} revoked.`);
  };

  const card = 'flex min-w-0 flex-col gap-4 rounded-2xl border border-transparent bg-card p-4 shadow-card';

  return (
    <section
      data-slot="members"
      aria-label="Members"
      aria-busy={loading || undefined}
      className={cn('@container flex min-w-0 flex-col gap-4', className)}
      {...props}
    >
      <div className="flex flex-col gap-0.5">
        <h2 className="text-title font-medium">Members</h2>
        <p className="text-small text-muted-foreground">Invite people to {workspace} and choose what each can do.</p>
      </div>

      <form className={card} onSubmit={send}>
        <div className="flex flex-col gap-3 @lg:flex-row @lg:items-start">
          <Field invalid={rejected.length > 0} className="min-w-0 flex-1">
            <FieldLabel>Invite by email</FieldLabel>
            <TagsInput
              aria-label="Email addresses to invite"
              name="emails"
              delimiters={[',', ';', ' ']}
              validate={isNew}
              max={maxInvitesAtOnce}
              suggestions={suggestions.filter((email) => !taken.has(email.toLocaleLowerCase()))}
              value={emails}
              onValueChange={(next) => {
                setEmails(next);
                setConfirmation('');
              }}
              placeholder="name@acme.example"
            />
            {rejected.length > 0 ? (
              <FieldError>
                {mistyped.length > 0
                  ? `Fix or remove ${mistyped.length === 1 ? mistyped[0] : `the ${mistyped.length} addresses in red`}: an address ends in a domain, such as acme.example.`
                  : `${taking.length === 1 ? taking[0] : `${taking.length} addresses`} already ${taking.length === 1 ? 'belongs' : 'belong'} to a member or a pending invite.`}
              </FieldError>
            ) : (
              <FieldDescription>
                {roleLabels[inviteRole]} {roleHints[inviteRole]}. Paste a list, or press Enter after each address.
              </FieldDescription>
            )}
          </Field>
          <div className="flex items-center gap-2 @lg:pt-6">
            <RoleSelect aria-label="Role for new invites" className="h-8.5 w-32" value={inviteRole} onValueChange={setInviteRole} />
            <Button type="submit" variant="primary" size="lg" disabled={!canSend || loading}>
              {emails.length > 1 ? `Send ${emails.length} invites` : 'Send invite'}
            </Button>
          </div>
        </div>
        <p role="status" className={cn('text-small text-foreground', !confirmation && 'sr-only')}>
          {confirmation}
        </p>
      </form>

      <div ref={membersRef} className={card}>
        <div className="flex flex-col gap-0.5">
          <h3 data-slot="members-heading" tabIndex={-1} className="text-title outline-none">
            Members
          </h3>
          <p className="text-small text-muted-foreground tabular-nums">{loading ? 'Loading…' : countLabel(members.length, 'member', 'members')}</p>
        </div>
        <Table aria-label="Members" containerClassName="-mx-3 w-auto">
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden @md:table-cell">Status</TableHead>
              <TableHead className="hidden @2xl:table-cell">Last active</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }, (_, row) => (
                  <TableRow key={row}>
                    <TableCell>
                      <Skeleton className="h-8 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-7.5 w-24" />
                    </TableCell>
                    <TableCell className="hidden @md:table-cell">
                      <Skeleton className="h-3.5 w-16" />
                    </TableCell>
                    <TableCell className="hidden @2xl:table-cell">
                      <Skeleton className="h-3.5 w-20" />
                    </TableCell>
                    <TableCell />
                  </TableRow>
                ))
              : members.map((member) => {
                  const you = member.id === currentMemberId;
                  const locked = member.role === 'owner' || you;
                  return (
                    <TableRow key={member.id} data-member-id={member.id}>
                      <TableCell className="w-full max-w-0 min-w-20">
                        <PersonCell name={member.name} email={member.email} avatarUrl={member.avatarUrl} you={you} avatarClassName="hidden @md:flex" />
                      </TableCell>
                      <TableCell>
                        {member.role === 'owner' ? (
                          <Badge variant="secondary">Owner</Badge>
                        ) : (
                          <RoleSelect
                            aria-label={`Role of ${member.name}`}
                            value={member.role as AssignableRole}
                            disabled={you}
                            onValueChange={(role) => changeRole(member, role)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="hidden @md:table-cell">
                        <StatusDot status={member.status === 'suspended' ? 'skipped' : 'done'}>
                          {member.status === 'suspended' ? 'Suspended' : 'Active'}
                        </StatusDot>
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-muted-foreground @2xl:table-cell">{member.lastActive ?? 'Never'}</TableCell>
                      <TableCell className="text-end">
                        {locked ? null : (
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="item" size="icon" aria-label={`Actions for ${member.name}`} />}>
                              <Ellipsis aria-hidden />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                  setRemoving(member);
                                  setRemoveOpen(true);
                                }}>
                                <UserMinus aria-hidden />
                                Remove from {workspace}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>

      <div ref={invitesRef} className={card}>
        <div className="flex flex-col gap-0.5">
          <h3 data-slot="invites-heading" tabIndex={-1} className="text-title outline-none">
            Pending invites
          </h3>
          <p className="text-small text-muted-foreground tabular-nums">
            {loading ? 'Loading…' : invites.length === 0 ? 'Nobody is waiting' : countLabel(invites.length, 'invite', 'invites')}
          </p>
        </div>
        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : invites.length === 0 ? (
          <Empty className="p-0 py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Mail />
              </EmptyMedia>
              <EmptyTitle render={<h4 />}>No pending invites</EmptyTitle>
              <EmptyDescription>Invites you send show up here until they are accepted.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {invites.map((invite) => (
              <li key={invite.id} data-invite-id={invite.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0">
                <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
                  <PersonCell email={invite.email} />
                  <p className="ms-11 truncate text-small text-muted-foreground">
                    {roleLabels[invite.role]} · {invite.sentLabel}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusDot status={invite.status === 'expired' ? 'error' : 'waiting'} className="text-small">
                    {invite.status === 'expired' ? 'Expired' : 'Pending'}
                  </StatusDot>
                  <div className="flex items-center gap-1">
                    <Button variant="secondary" size="sm" onClick={() => resend(invite)} aria-label={`Resend invite to ${invite.email}`}>
                      Resend
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => revoke(invite)} aria-label={`Revoke invite to ${invite.email}`}>
                      Revoke
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        onOpenChangeComplete={(open) => {
          const target = focusAfterRemove.current;
          if (open || target === null) return;
          focusAfterRemove.current = null;
          const trigger = membersRef.current?.querySelector<HTMLElement>(`[data-member-id="${target}"] button[data-slot=dropdown-menu-trigger]`);
          (trigger ?? membersRef.current?.querySelector<HTMLElement>('[data-slot=members-heading]'))?.focus();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {removing?.name}?</DialogTitle>
            <DialogDescription>They lose access to {workspace} right away. Their work stays with the workspace.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="break-words">{removing?.email}</p>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={confirmRemove}>
              Remove member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export { Members, type AssignableRole, type Invite, type Member, type MemberRole, type MembersProps };
