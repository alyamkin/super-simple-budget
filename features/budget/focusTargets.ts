import type { RowId } from "@/domain/budget";

/**
 * Ids of the elements focus moves to after a pick or a removal (Spec §12).
 * Row ids are unique across the budget, so these are unique on the page.
 */
export const focusTargets = {
  amount: (id: RowId) => `amount-${id}`,
  label: (id: RowId) => `label-${id}`,
  remove: (id: RowId) => `remove-${id}`,
  pickerHeading: "picker-heading",
};

/** Focuses the element with this id, if it is on the page. */
export function focusById(id: string) {
  document.getElementById(id)?.focus();
}
