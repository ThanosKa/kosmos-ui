'use client';

import { Meter, MeterSegments, MeterValue } from '@/registry/kosmos/ui/meter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

const projects = [
  { name: 'Fernhill Books', quota: 49 },
  { name: 'Ironbark Logistics', quota: 79 },
  { name: 'Copperline Bank', quota: 109 },
];

export default function MeterTableExample() {
  return (
    <Table aria-label="Event quota by project" className="max-w-md">
      <TableHeader>
        <TableRow>
          <TableHead className="ps-4">Project</TableHead>
          <TableHead className="pe-4">Event quota</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.name}>
            <TableCell className="ps-4">{project.name}</TableCell>
            <TableCell className="pe-4">
              <Meter
                value={Math.min(project.quota, 100)}
                tone="auto"
                low={75}
                high={95}
                optimum={0}
                aria-label={`${project.name} event quota`}
                getAriaValueText={() => `${project.quota}% of the monthly allowance used`}
                className="w-36 grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-y-0"
              >
                <MeterSegments count={10} className="col-span-1 h-3" />
                <MeterValue className="row-start-1 text-caption">{() => `${project.quota}%`}</MeterValue>
              </Meter>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
