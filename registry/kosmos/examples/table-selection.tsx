import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

const people = [
  { name: 'Eleni Markou', role: 'Designer', selected: false },
  { name: 'Nikos Pappas', role: 'Engineer', selected: true },
  { name: 'Sofia Lambrou', role: 'Product manager', selected: false },
];

export default function TableSelection() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {people.map((person) => (
          <TableRow key={person.name} data-state={person.selected ? 'selected' : undefined}>
            <TableCell className="font-medium">{person.name}</TableCell>
            <TableCell>{person.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
