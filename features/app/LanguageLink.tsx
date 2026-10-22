"use client";

import Link from "next/link";
import { LOCALE_COOKIE, locales, regionalLocale } from "@/i18n/config";
import { useTranslator } from "@/i18n/I18nProvider";

const ONE_YEAR_S = 60 * 60 * 24 * 365;

/**
 * Link to the same page in the other language. Remembers the
 * choice in the cookie `proxy.ts` reads for `/`. The budget survives the
 * switch because it lives in local storage.
 */
export function LanguageLink({ className }: { className?: string }) {
  const { locale, t } = useTranslator();
  const target = locales.find((other) => other !== locale) ?? locale;

  return (
    <Link
      href={`/${target}`}
      hrefLang={regionalLocale(target)}
      lang={regionalLocale(target)}
      aria-label={t("language.switchAria")}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${ONE_YEAR_S}; samesite=lax`;
      }}
      className={className}
    >
      {t("language.switchLabel")}
    </Link>
  );
}
