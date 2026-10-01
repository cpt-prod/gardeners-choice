export function formatTokens(n: number): string {
  if (n === 1) return "1 token";
  return `${n} tokens`;
}

export function formatRelativeTime(input: number | string): string {
  const ts = typeof input === "string" ? Date.parse(input) : input;
  if (Number.isNaN(ts)) return "";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function pluralize(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
