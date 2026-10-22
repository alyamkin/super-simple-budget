type ClassValue = string | false | null | undefined;

/** Joins truthy class names with a single space: `classNames("a", on && "b")`. */
export function classNames(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
