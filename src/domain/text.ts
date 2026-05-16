export function normalizeArray<T = unknown>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flat(3) as T[];
  return [value];
}

export function uniqueValues<T>(values: T[]): T[] {
  return values.filter((value, index, list) => Boolean(value) && list.indexOf(value) === index);
}

export function cleanWiki(value: unknown): string {
  if (!value) return "";
  return String(value).replace(/^\[\[/, "").replace(/\]\]$/, "").split("|")[0].trim();
}

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function titleCaseWords(value: unknown): string {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => titleCase(word.toLowerCase()))
    .join(" ");
}
