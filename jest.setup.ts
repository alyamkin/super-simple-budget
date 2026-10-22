import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

// jsdom has no modal dialogs yet: open/close just toggle `open` and fire `close`.
if (
  typeof HTMLDialogElement !== "undefined" &&
  !HTMLDialogElement.prototype.showModal
) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
    this.querySelector<HTMLElement>(
      "button, input, select, textarea, [tabindex]",
    )?.focus();
  };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
}

// jsdom logs "Not implemented" for scrolling; step changes scroll to the top.
if (typeof window !== "undefined") {
  window.scrollTo = jest.fn();
}
