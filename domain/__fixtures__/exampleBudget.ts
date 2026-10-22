import type { Budget, Row } from "@/domain/budget";
import type { ItemId } from "@/domain/catalog/items";
import type { Frequency } from "@/domain/frequency";

const row = (id: ItemId, amount: number, frequency: Frequency): Row => ({
  kind: "catalog",
  id,
  amount,
  frequency,
});

/**
 * The artifact's `EXAMPLE` budget: every bucket, several
 * frequencies and a rough total for family (its rows are kept but ignored).
 */
export const EXAMPLE_BUDGET: Budget = {
  rows: {
    income: [
      row("myNetIncome", 2150, "Every2Weeks"),
      row("spouseNetIncome", 1850, "Every2Weeks"),
    ],
    savings: [
      row("emergencyFund", 150, "Monthly"),
      row("retirement", 250, "Monthly"),
      row("homePurchase", 200, "Monthly"),
    ],
    home: [
      row("rent", 2350, "Monthly"),
      row("tenantInsurance", 28, "Monthly"),
      row("electricity", 95, "Monthly"),
      row("internet", 70, "Monthly"),
      row("telephone", 110, "Monthly"),
      row("subscriptions", 35, "Monthly"),
      row("bankFees", 17, "Monthly"),
      row("taxPrep", 150, "Annually"),
    ],
    around: [
      row("carPayments", 430, "Monthly"),
      row("carInsurance", 175, "Monthly"),
      row("gas", 60, "Weekly"),
      row("transitPass", 156, "Monthly"),
      row("carRegistration", 120, "Annually"),
    ],
    everyday: [
      row("groceries", 210, "Weekly"),
      row("restaurants", 70, "Weekly"),
      row("clothes", 150, "Monthly"),
      row("hairdresser", 60, "Monthly"),
      row("dentist", 400, "Annually"),
    ],
    family: [
      row("travel", 3000, "Annually"),
      row("gifts", 1200, "Annually"),
      row("memberships", 900, "Annually"),
    ],
    debt: [
      row("creditCard", 300, "Monthly"),
      row("studentLoan", 240, "Monthly"),
    ],
  },
  estimates: {
    family: { enabled: true, amount: 450, frequency: "Monthly" },
  },
};
