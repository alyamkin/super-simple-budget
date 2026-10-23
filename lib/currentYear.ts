import { cacheLife } from "next/cache";

/** This year, cached for a day so prerendered pages can show it. */
export async function currentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
