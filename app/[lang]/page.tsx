import { notFound } from "next/navigation";
import { BudgetApp } from "@/features/app/BudgetApp";
import { Footer } from "@/features/app/Footer";
import { Header } from "@/features/app/Header";
import { SkipLink } from "@/features/app/SkipLink";
import { serializeJsonLd, webApplicationJsonLd } from "@/features/seo/jsonLd";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { currentYear } from "@/lib/currentYear";

/** Server shell around the client island. */
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);
  const { app, footer } = dictionary;
  const year = await currentYear();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(webApplicationJsonLd(lang, dictionary)),
        }}
      />
      <SkipLink label={app.skipToMain} />
      <div className="mx-auto w-full max-w-[1120px] pt-5 pr-[max(16px,env(safe-area-inset-right,0px))] pb-[120px] pl-[max(16px,env(safe-area-inset-left,0px))]">
        <Header app={app} />
        <BudgetApp />
        <Footer footer={footer} year={year} />
      </div>
    </>
  );
}
