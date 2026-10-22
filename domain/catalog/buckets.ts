import { ITEMS, type CatalogItem, type ItemId } from "./items";

/** Wizard steps in order: one per bucket, then the results. */
export const STEPS = [
  "income",
  "savings",
  "home",
  "around",
  "everyday",
  "family",
  "debt",
  "results",
] as const;

export type StepId = (typeof STEPS)[number];

/** Index of the results step (the last one). */
export const RESULTS_STEP = STEPS.length - 1;

/** Index of the last bucket step, just before the results. */
export const LAST_BUCKET_STEP = RESULTS_STEP - 1;

export type BucketId = Exclude<StepId, "results">;

export const BUCKET_IDS = STEPS.filter(
  (step): step is BucketId => step !== "results",
);

export type OutgoingBucketId = Exclude<BucketId, "income">;

/** Buckets that money goes out to (everything but income). */
export const OUTGOING_BUCKETS = BUCKET_IDS.filter(
  (bucket): bucket is OutgoingBucketId => bucket !== "income",
);

/** Buckets that accept one rough total instead of itemized rows. */
export const ESTIMABLE_BUCKETS = ["home", "around", "everyday", "family"] as const;

export type EstimableBucketId = (typeof ESTIMABLE_BUCKETS)[number];

export function isEstimable(bucket: BucketId): bucket is EstimableBucketId {
  return (ESTIMABLE_BUCKETS as readonly BucketId[]).includes(bucket);
}

type Bucket = {
  /** Items whose `category` is listed here belong to this bucket. */
  categories: readonly CatalogItem["category"][];
  /** Chips shown before "Show more", in this order. */
  popular: readonly ItemId[];
  /** CSS colour variable for charts; income is not charted as spending. */
  color: `--b-${string}` | null;
};

export const BUCKETS: Record<BucketId, Bucket> = {
  income: {
    categories: [null],
    popular: [
      "myNetIncome",
      "spouseNetIncome",
      "selfEmploymentIncome",
      "gigIncome",
      "childBenefits",
      "employmentInsurance",
      "federalPension",
    ],
    color: null,
  },
  savings: {
    categories: ["savings"],
    popular: [
      "emergencyFund",
      "tfsa",
      "retirement",
      "fhsa",
      "education",
      "homePurchase",
      "incomeTax",
    ],
    color: "--b-save",
  },
  home: {
    categories: ["housing", "communications", "insurance", "fees"],
    popular: [
      "rent",
      "mortgage",
      "electricity",
      "heating",
      "internet",
      "telephone",
      "tenantInsurance",
      "homeInsurance",
      "subscriptions",
      "bankFees",
    ],
    color: "--b-home",
  },
  around: {
    categories: ["transportation"],
    popular: [
      "carPayments",
      "carInsurance",
      "gas",
      "transitPass",
      "maintenance",
      "parking",
      "rideServices",
    ],
    color: "--b-around",
  },
  everyday: {
    categories: ["food", "medical", "clothing", "personalCare"],
    popular: [
      "groceries",
      "restaurants",
      "prescriptions",
      "clothes",
      "hairdresser",
      "dentist",
    ],
    color: "--b-everyday",
  },
  family: {
    categories: ["childcare", "education", "recreation", "pets", "giftsDonations"],
    popular: [
      "daycare",
      "tuition",
      "travel",
      "memberships",
      "tickets",
      "petFood",
      "gifts",
      "donations",
    ],
    color: "--b-family",
  },
  debt: {
    categories: ["debt"],
    popular: ["creditCard", "lineOfCredit", "studentLoan", "personalLoan"],
    color: "--b-debt",
  },
};

/** A bucket's chart colour as a CSS value, e.g. `var(--b-home)`. */
export const bucketColor = (bucket: OutgoingBucketId): string =>
  `var(${BUCKETS[bucket].color})`;

/** The bucket each item is added to, wherever it was picked from. */
export const BUCKET_OF_ITEM = Object.fromEntries(
  ITEMS.map((item) => [
    item.id,
    BUCKET_IDS.find((bucket) =>
      BUCKETS[bucket].categories.includes(item.category),
    ),
  ]),
) as Record<ItemId, BucketId>;

const itemsIn = (bucket: BucketId): readonly ItemId[] =>
  ITEMS.filter((item) => BUCKET_OF_ITEM[item.id] === bucket).map(
    (item) => item.id,
  );

/** Each bucket's items in catalog order (the chip order). */
export const ITEMS_BY_BUCKET: Record<BucketId, readonly ItemId[]> = {
  income: itemsIn("income"),
  savings: itemsIn("savings"),
  home: itemsIn("home"),
  around: itemsIn("around"),
  everyday: itemsIn("everyday"),
  family: itemsIn("family"),
  debt: itemsIn("debt"),
};
