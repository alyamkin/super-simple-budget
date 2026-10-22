import { useId, type ReactNode } from "react";

type ResultCardProps = {
  title: string;
  /** Short muted text beside the title, e.g. "3 of 5 items". */
  aside?: string;
  children: ReactNode;
};

/**
 * A results panel around a chart: a `figure` captioned by its `h3`
 * (Spec §10.0), so the decorative chart and its text read as one unit. The
 * figure is named by the heading alone, without the aside.
 */
export function ResultCard({ title, aside, children }: ResultCardProps) {
  const titleId = useId();
  return (
    <figure
      aria-labelledby={titleId}
      className="m-0 mb-3 min-w-0 rounded-card border border-line bg-surface px-[18px] py-4 max-tablet:p-3.5"
    >
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2.5">
        <h3 id={titleId} className="text-[1.1rem] font-bold max-tablet:text-[1.05rem]">
          {title}
        </h3>
        {aside && <span className="text-[.85rem] text-muted">{aside}</span>}
      </figcaption>
      {children}
    </figure>
  );
}
