import { classNames } from "@/lib/classNames";

export type SegmentedOption<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  /** Names the group, e.g. "Show amounts per". */
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
};

/** Mutually exclusive toggle buttons (`aria-pressed`), e.g. Monthly / Yearly. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={classNames(
        "inline-flex overflow-hidden rounded-[7px] border border-line text-xs",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onValueChange(option.value)}
          className="border-0 bg-transparent px-[9px] py-1 aria-pressed:bg-accent aria-pressed:font-bold aria-pressed:text-surface pointer-coarse:px-3 pointer-coarse:py-2"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
