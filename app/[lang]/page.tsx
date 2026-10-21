import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, locales, toBcp47 } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

const BUCKET_SWATCHES = [
  "bg-b-home",
  "bg-b-around",
  "bg-b-everyday",
  "bg-b-family",
  "bg-b-debt",
  "bg-b-save",
];

/** Placeholder until the app shell lands (PLAN step 10). */
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { app, language, footer } = await getDictionary(lang);
  const otherLang = locales.find((locale) => locale !== lang) ?? lang;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.3rem] font-bold">{app.name}</h1>
          <p className="text-sm text-muted">{app.subtitle}</p>
        </div>
        <Link
          href={`/${otherLang}`}
          hrefLang={toBcp47(otherLang)}
          lang={toBcp47(otherLang)}
          aria-label={language.switchAria}
          className="rounded-lg border border-line px-3 py-2 font-bold text-accent"
        >
          {language.switchLabel}
        </Link>
      </header>

      <main className="mt-6 rounded-card border border-line bg-surface p-[18px]">
        <div className="flex gap-2" aria-hidden="true">
          {BUCKET_SWATCHES.map((swatch) => (
            <span key={swatch} className={`size-4 rounded-[3px] ${swatch}`} />
          ))}
        </div>
      </main>

      <footer className="mt-6 space-y-1 text-sm text-muted">
        <h2 className="font-bold text-ink">{footer.about}</h2>
        <p>
          {footer.privacy} {footer.advice}
        </p>
        <p>
          {footer.credit}{" "}
          <a
            href={footer.creditUrl}
            target="_blank"
            rel="noopener"
            className="text-accent"
          >
            {footer.creditLink}
            <span className="sr-only"> {footer.newTab}</span>
          </a>
          .
        </p>
        <p>{footer.notAffiliated}</p>
      </footer>
    </div>
  );
}
