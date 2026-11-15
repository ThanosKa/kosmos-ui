/** One decimal under 10s, whole seconds under a minute, then minutes and hours: "1.4s", "30s", "2m 05s", "1h 02m". */
export function formatDuration(ms: number) {
  const safe = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  const tenths = Math.round(safe / 100);
  if (tenths < 100) return `${(tenths / 10).toFixed(1)}s`;
  const seconds = Math.round(safe / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${String(seconds % 60).padStart(2, '0')}s`;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}
