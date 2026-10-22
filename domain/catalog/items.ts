import type { Frequency } from "@/domain/frequency";
import type { CategoryId } from "./categories";

/** Account a savings goal usually lives in; shown as a tag next to the item. */
export type FundType = "RRSP" | "RESP" | "TFSA" | "FHSA";

type ItemDefinition = {
  id: string;
  /** `null` for income, `"savings"` for savings goals, else the expense category. */
  category: CategoryId | "savings" | null;
  defaultFrequency: Frequency;
  fundType?: FundType;
};

/**
 * Every item a user can pick, from the artifact's `D`. Text lives in the
 * dictionaries under `items.{id}`.
 *
 * Ids are saved in budget files: never rename or delete one. Retire it in
 * `retired.ts` instead.
 */
const DEFINITIONS = [
  // Income
  { id: "myNetIncome", category: null, defaultFrequency: "Every2Weeks" },
  { id: "spouseNetIncome", category: null, defaultFrequency: "Every2Weeks" },
  { id: "employmentInsurance", category: null, defaultFrequency: "Every2Weeks" },
  { id: "rentalIncome", category: null, defaultFrequency: "Monthly" },
  { id: "federalPension", category: null, defaultFrequency: "Monthly" },
  { id: "employerPension", category: null, defaultFrequency: "Monthly" },
  { id: "personalRetirement", category: null, defaultFrequency: "Monthly" },
  { id: "studentLoanIncome", category: null, defaultFrequency: "Monthly" },
  { id: "childSupportIncome", category: null, defaultFrequency: "Monthly" },
  { id: "childBenefits", category: null, defaultFrequency: "Monthly" },
  { id: "disabilityBenefit", category: null, defaultFrequency: "Monthly" },
  { id: "socialAssistance", category: null, defaultFrequency: "Monthly" },
  { id: "selfEmploymentIncome", category: null, defaultFrequency: "Monthly" },
  { id: "gigIncome", category: null, defaultFrequency: "Monthly" },
  { id: "spousalSupportIncome", category: null, defaultFrequency: "Monthly" },
  { id: "investmentIncome", category: null, defaultFrequency: "Quarterly" },
  // Savings
  { id: "emergencyFund", category: "savings", defaultFrequency: "Monthly" },
  { id: "retirement", category: "savings", defaultFrequency: "Monthly", fundType: "RRSP" },
  { id: "education", category: "savings", defaultFrequency: "Monthly", fundType: "RESP" },
  { id: "homePurchase", category: "savings", defaultFrequency: "Monthly" },
  { id: "homeRenovation", category: "savings", defaultFrequency: "Monthly" },
  { id: "carPurchase", category: "savings", defaultFrequency: "Monthly" },
  { id: "incomeTax", category: "savings", defaultFrequency: "Annually" },
  { id: "tfsa", category: "savings", defaultFrequency: "Monthly", fundType: "TFSA" },
  { id: "fhsa", category: "savings", defaultFrequency: "Monthly", fundType: "FHSA" },
  // Expenses (artifact order: it is the chip order inside each bucket)
  { id: "creditCard", category: "debt", defaultFrequency: "Monthly" },
  { id: "lineOfCredit", category: "debt", defaultFrequency: "Monthly" },
  { id: "personalLoan", category: "debt", defaultFrequency: "Monthly" },
  { id: "studentLoan", category: "debt", defaultFrequency: "Monthly" },
  { id: "overdraft", category: "debt", defaultFrequency: "Monthly" },
  { id: "paydayLoan", category: "debt", defaultFrequency: "Monthly" },
  { id: "craDebt", category: "debt", defaultFrequency: "Monthly" },
  { id: "rent", category: "housing", defaultFrequency: "Monthly" },
  { id: "mortgage", category: "housing", defaultFrequency: "Monthly" },
  { id: "heloc", category: "housing", defaultFrequency: "Monthly" },
  { id: "propertyTax", category: "housing", defaultFrequency: "Monthly" },
  { id: "condoFee", category: "housing", defaultFrequency: "Monthly" },
  { id: "tenantInsurance", category: "housing", defaultFrequency: "Monthly" },
  { id: "homeInsurance", category: "housing", defaultFrequency: "Monthly" },
  { id: "furniture", category: "housing", defaultFrequency: "Annually" },
  { id: "outdoorEquipment", category: "housing", defaultFrequency: "Annually" },
  { id: "homeSecurity", category: "housing", defaultFrequency: "Monthly" },
  { id: "electricity", category: "housing", defaultFrequency: "Monthly" },
  { id: "waterSewage", category: "housing", defaultFrequency: "Monthly" },
  { id: "heating", category: "housing", defaultFrequency: "Monthly" },
  { id: "homeMaintenance", category: "housing", defaultFrequency: "Annually" },
  { id: "telephone", category: "communications", defaultFrequency: "Monthly" },
  { id: "cable", category: "communications", defaultFrequency: "Monthly" },
  { id: "internet", category: "communications", defaultFrequency: "Monthly" },
  { id: "combined", category: "communications", defaultFrequency: "Monthly" },
  { id: "subscriptions", category: "communications", defaultFrequency: "Monthly" },
  { id: "groceries", category: "food", defaultFrequency: "Weekly" },
  { id: "restaurants", category: "food", defaultFrequency: "Weekly" },
  { id: "life", category: "insurance", defaultFrequency: "Monthly" },
  { id: "medical", category: "insurance", defaultFrequency: "Monthly" },
  { id: "disability", category: "insurance", defaultFrequency: "Monthly" },
  { id: "carPayments", category: "transportation", defaultFrequency: "Monthly" },
  { id: "carInsurance", category: "transportation", defaultFrequency: "Monthly" },
  { id: "gas", category: "transportation", defaultFrequency: "Weekly" },
  { id: "maintenance", category: "transportation", defaultFrequency: "Monthly" },
  { id: "carRegistration", category: "transportation", defaultFrequency: "Annually" },
  { id: "parking", category: "transportation", defaultFrequency: "Monthly" },
  { id: "transitPass", category: "transportation", defaultFrequency: "Monthly" },
  { id: "rideServices", category: "transportation", defaultFrequency: "Monthly" },
  { id: "tolls", category: "transportation", defaultFrequency: "Monthly" },
  { id: "carShare", category: "transportation", defaultFrequency: "Monthly" },
  { id: "bike", category: "transportation", defaultFrequency: "Annually" },
  { id: "daycare", category: "childcare", defaultFrequency: "Monthly" },
  { id: "babysitting", category: "childcare", defaultFrequency: "Monthly" },
  { id: "childSupport", category: "childcare", defaultFrequency: "Monthly" },
  { id: "childrensAllowance", category: "childcare", defaultFrequency: "Monthly" },
  { id: "summerCamps", category: "childcare", defaultFrequency: "Annually" },
  { id: "schoolLunches", category: "childcare", defaultFrequency: "Monthly" },
  { id: "tuition", category: "education", defaultFrequency: "Annually" },
  { id: "schoolSupplies", category: "education", defaultFrequency: "Annually" },
  { id: "schoolTrips", category: "education", defaultFrequency: "Annually" },
  { id: "travel", category: "recreation", defaultFrequency: "Annually" },
  { id: "memberships", category: "recreation", defaultFrequency: "Annually" },
  { id: "childrenToys", category: "recreation", defaultFrequency: "Monthly" },
  { id: "tickets", category: "recreation", defaultFrequency: "Monthly" },
  { id: "sportsGear", category: "recreation", defaultFrequency: "Monthly" },
  { id: "entertainmentEquipment", category: "recreation", defaultFrequency: "Monthly" },
  { id: "alcohol", category: "recreation", defaultFrequency: "Monthly" },
  { id: "smoking", category: "recreation", defaultFrequency: "Monthly" },
  { id: "hairdresser", category: "personalCare", defaultFrequency: "Monthly" },
  { id: "cosmetics", category: "personalCare", defaultFrequency: "Monthly" },
  { id: "spa", category: "personalCare", defaultFrequency: "Monthly" },
  { id: "clothes", category: "clothing", defaultFrequency: "Monthly" },
  { id: "childrenClothes", category: "clothing", defaultFrequency: "Monthly" },
  { id: "accessories", category: "clothing", defaultFrequency: "Monthly" },
  { id: "doctor", category: "medical", defaultFrequency: "Annually" },
  { id: "dentist", category: "medical", defaultFrequency: "Annually" },
  { id: "specialists", category: "medical", defaultFrequency: "Annually" },
  { id: "prescriptions", category: "medical", defaultFrequency: "Monthly" },
  { id: "eyewear", category: "medical", defaultFrequency: "Annually" },
  { id: "petFood", category: "pets", defaultFrequency: "Monthly" },
  { id: "veterinarian", category: "pets", defaultFrequency: "Annually" },
  { id: "bankFees", category: "fees", defaultFrequency: "Monthly" },
  { id: "creditCardFees", category: "fees", defaultFrequency: "Annually" },
  { id: "professionalDues", category: "fees", defaultFrequency: "Annually" },
  { id: "taxPrep", category: "fees", defaultFrequency: "Annually" },
  { id: "legalFees", category: "fees", defaultFrequency: "Annually" },
  { id: "gifts", category: "giftsDonations", defaultFrequency: "Annually" },
  { id: "donations", category: "giftsDonations", defaultFrequency: "Annually" },
] as const satisfies readonly ItemDefinition[];

export type ItemId = (typeof DEFINITIONS)[number]["id"];

export type CatalogItem = ItemDefinition & { id: ItemId };

export const ITEMS: readonly CatalogItem[] = DEFINITIONS;

export const ITEMS_BY_ID = Object.fromEntries(
  ITEMS.map((item) => [item.id, item]),
) as Record<ItemId, CatalogItem>;

export function isItemId(value: unknown): value is ItemId {
  return typeof value === "string" && Object.hasOwn(ITEMS_BY_ID, value);
}
