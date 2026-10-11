import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/registry/kosmos/ui/avatar';

const team = [
  { name: 'Maria Lopez', initials: 'ML', src: '/avatars/avatar-1.png' },
  { name: 'Jonas Keller', initials: 'JK', src: '/avatars/avatar-2.png' },
  { name: 'Aiko Nakamura', initials: 'AN', src: '/avatars/avatar-3.png' },
];

export default function AvatarGroupExample() {
  return (
    <AvatarGroup>
      {team.map((person) => (
        <Avatar key={person.name}>
          <AvatarImage src={person.src} alt={person.name} />
          <AvatarFallback>{person.initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>
        +5<span className="sr-only"> more</span>
      </AvatarGroupCount>
    </AvatarGroup>
  );
}
