import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';

const projects = [
  { id: 'fernhill', name: 'Fernhill Books' },
  { id: 'cirrus', name: 'Cirrus Weather' },
  { id: 'ironbark', name: 'Ironbark Logistics' },
];

export default function AvatarLogo() {
  return (
    <div className="flex items-center gap-3">
      {projects.map((project) => (
        <Avatar key={project.id} className="rounded-md">
          <AvatarImage src={`/logos/${project.id}.svg`} alt={project.name} />
          <AvatarFallback>{project.name.charAt(0)}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
