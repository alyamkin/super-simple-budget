const pad = (n: number) => String(n).padStart(2, "0");

/** `my-budget-2026-10-22.json`: the local date, so it matches the user's day. */
export function fileName(base: string, extension: string, date = new Date()): string {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `${base}-${day}.${extension}`;
}
