export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfWeek(date: Date): Date {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

export function addDays(date: Date, count: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

export function rangeDays(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    return date;
  });
}

export function formatDateKey(date: Date): string {
  const d = startOfDay(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isDateKey(value: unknown): value is string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const date = new Date(`${value}T00:00:00`);
  return Number.isFinite(date.getTime()) && formatDateKey(date) === value;
}

export function rangeDateKeys(fromKey: string, toKey: string): string[] {
  if (!isDateKey(fromKey) || !isDateKey(toKey) || fromKey > toKey) return [];
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  const count = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
  return rangeDays(from, count).map(formatDateKey);
}

export function weekdayShortName(dayKey: string): string {
  if (!isDateKey(dayKey)) return "";
  return new Date(`${dayKey}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" });
}

export function clampIndex(value: unknown, length: number): number {
  const index = Number.isInteger(value) ? Number(value) : length;
  return Math.max(0, Math.min(index, length));
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
