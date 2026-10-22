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

// jsdom has no layout observers; Recharts' ResponsiveContainer needs one.
// `active` holds the observers still watching something, for leak tests.
if (typeof window !== "undefined" && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    static active = new Set<ResizeObserver>();
    private targets = new Set<Element>();
    observe(target: Element) {
      this.targets.add(target);
      ResizeObserver.active.add(this);
    }
    unobserve(target: Element) {
      this.targets.delete(target);
      if (!this.targets.size) ResizeObserver.active.delete(this);
    }
    disconnect() {
      this.targets.clear();
      ResizeObserver.active.delete(this);
    }
  };
}
