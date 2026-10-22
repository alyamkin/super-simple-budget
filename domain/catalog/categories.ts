/** Expense categories, from the artifact's `D.cats`. The rules of thumb are per category. */
export const CATEGORY_IDS = [
  "debt",
  "housing",
  "communications",
  "food",
  "insurance",
  "transportation",
  "childcare",
  "education",
  "recreation",
  "personalCare",
  "clothing",
  "medical",
  "pets",
  "fees",
  "giftsDonations",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];
