import { notFound } from "next/navigation";
import { BudgetApp } from "@/features/app/BudgetApp";
import { Footer } from "@/features/app/Footer";
import { Header } from "@/features/app/Header";
import { SkipLink } from "@/features/app/SkipLink";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";

/** Server shell around the client island (Spec §4, §14.1). */
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { app, footer } = await getDictionary(lang);

  return (
    <>
      <SkipLink label={app.skipToMain} />
      <div className="mx-auto w-full max-w-[1120px] pt-5 pr-[max(16px,env(safe-area-inset-right,0px))] pb-[120px] pl-[max(16px,env(safe-area-inset-left,0px))]">
        <Header app={app} />
        <BudgetApp />
        <Footer footer={footer} />
      </div>
    </>
  );
}
