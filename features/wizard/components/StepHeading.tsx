import { STEP_HEADING_ID } from "../useGoToStep";

type StepHeadingProps = {
  eyebrow: string;
  title: string;
  lede?: string;
};

/**
 * Eyebrow, `h2` and lede at the top of a step. The `h2` is focusable from
 * script only: step changes move focus to it (`useGoToStep`).
 */
export function StepHeading({ eyebrow, title, lede }: StepHeadingProps) {
  return (
    <>
      <p className="m-0 text-xs font-bold tracking-widest text-accent uppercase">
        {eyebrow}
      </p>
      <h2
        id={STEP_HEADING_ID}
        tabIndex={-1}
        className="mt-1.5 mb-2 text-[2rem] font-bold max-tablet:text-[1.6rem] max-phone:text-[1.45rem]"
      >
        {title}
      </h2>
      {lede && <p className="mt-0 mb-[22px] max-w-[60ch] text-muted">{lede}</p>}
    </>
  );
}
