import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';

export default function AvatarDemo() {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="/avatars/lena.jpg" alt="Lena Park" />
        <AvatarFallback>LP</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>TO</AvatarFallback>
      </Avatar>
    </div>
  );
}
