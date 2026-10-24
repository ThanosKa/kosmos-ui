import { Badge, type BadgeProps } from '@/registry/kosmos/ui/badge';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

const methodTints: Record<Method, BadgeProps['variant']> = {
  GET: 'tint-green',
  POST: 'tint-blue',
  PATCH: 'tint-orange',
  DELETE: 'tint-red',
};

function statusTint(code: number): BadgeProps['variant'] {
  if (code >= 200 && code < 300) return 'tint-green';
  if (code >= 400 && code < 500) return 'tint-orange';
  if (code >= 500) return 'tint-red';
  return 'tint-gray';
}

const requests: { method: Method; path: string; code: number }[] = [
  { method: 'POST', path: '/v1/events', code: 202 },
  { method: 'GET', path: '/v1/projects/cirrus', code: 200 },
  { method: 'PATCH', path: '/v1/projects/cirrus', code: 304 },
  { method: 'POST', path: '/v1/events', code: 429 },
  { method: 'DELETE', path: '/v1/events/debug_ping', code: 500 },
];

export default function BadgeCodes() {
  return (
    <ul className="flex w-full max-w-md flex-col divide-y divide-border">
      {requests.map((request, index) => (
        <li key={index} className="flex items-center gap-3 py-2 text-body">
          <Badge variant={methodTints[request.method]} className="w-16">
            {request.method}
          </Badge>
          <span className="min-w-0 flex-1 truncate font-mono text-small">{request.path}</span>
          <Badge variant={statusTint(request.code)}>
            {request.code}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
