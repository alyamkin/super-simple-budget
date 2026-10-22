/** How often an amount is paid or received. */
export type Frequency =
  | "Daily"
  | "Weekly"
  | "Every2Weeks"
  | "TwiceMonthly"
  | "Monthly"
  | "Quarterly"
  | "Every6Months"
  | "Annually";

/** Occurrences per year. */
export const TIMES_PER_YEAR: Record<Frequency, number> = {
  Daily: 365,
  Weekly: 52,
  Every2Weeks: 26,
  TwiceMonthly: 24,
  Monthly: 12,
  Quarterly: 4,
  Every6Months: 2,
  Annually: 1,
};

/** Every frequency, most to least frequent (the select's option order). */
export const FREQUENCIES = Object.keys(TIMES_PER_YEAR) as Frequency[];

/** For rows and rough totals that have no frequency of their own yet. */
export const DEFAULT_FREQUENCY: Frequency = "Monthly";

/** Converts an amount paid at `frequency` to its monthly equivalent. */
export const toMonthly = (amount: number, frequency: Frequency): number =>
  (amount * TIMES_PER_YEAR[frequency]) / 12;
