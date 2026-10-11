import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';

export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="/avatars/avatar-1.png" alt="Maria Lopez" />
        <AvatarFallback>ML</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JK</AvatarFallback>
      </Avatar>
    </div>
  );
}
