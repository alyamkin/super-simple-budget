const BUCKET_SWATCHES = [
  "bg-b-home",
  "bg-b-around",
  "bg-b-everyday",
  "bg-b-family",
  "bg-b-debt",
  "bg-b-save",
];

/** Placeholder until the app shell lands (PLAN step 10). */
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 py-5">
      <h1 className="text-[1.3rem] font-bold">Super Simple Budget</h1>
      <p className="text-sm text-muted">Tap what you pay for, skip the rest</p>

      <section className="mt-6 rounded-card border border-line bg-surface p-[18px]">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">
          Coming soon
        </p>
        <h2 className="mt-1.5 mb-2 text-[2rem] font-bold">
          A budget in eight short steps
        </h2>
        <p className="max-w-[60ch] text-muted">
          Pick what you pay for, enter rough amounts and see how your plan
          compares with usual Canadian ranges.
        </p>
        <p className="mt-4 font-mono">$1,234.50 / month</p>
        <div className="mt-4 flex gap-2" aria-hidden="true">
          {BUCKET_SWATCHES.map((swatch) => (
            <span key={swatch} className={`size-4 rounded-[3px] ${swatch}`} />
          ))}
        </div>
      </section>
    </main>
  );
}
