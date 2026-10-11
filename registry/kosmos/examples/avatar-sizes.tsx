import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';

export default function AvatarSizes() {
  return (
    <div className="flex items-center gap-3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Avatar key={size} size={size}>
          <AvatarImage src="/avatars/avatar-2.png" alt="Jonas Keller" />
          <AvatarFallback>JK</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
