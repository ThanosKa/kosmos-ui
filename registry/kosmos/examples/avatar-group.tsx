import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/registry/kosmos/ui/avatar';

const team = [
  { name: 'Lena Park', initials: 'LP', src: '/avatars/avatar-1.png' },
  { name: 'Tomás Ortega', initials: 'TO', src: '/avatars/avatar-2.png' },
  { name: 'Ama Mensah', initials: 'AM', src: '/avatars/avatar-3.png' },
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
        +1<span className="sr-only"> more</span>
      </AvatarGroupCount>
    </AvatarGroup>
  );
}
