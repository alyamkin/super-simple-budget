"use client";

import { createContext, use, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import { createTranslator, type Translator } from "./translate";

const I18nContext = createContext<Translator | null>(null);

type I18nProviderProps = {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
};

/** Makes the active locale's dictionary available to client components. */
export function I18nProvider({
  locale,
  dictionary,
  children,
}: I18nProviderProps) {
  const translator = createTranslator(locale, dictionary);
  return <I18nContext value={translator}>{children}</I18nContext>;
}

export function useTranslator(): Translator {
  const translator = use(I18nContext);
  if (!translator) {
    throw new Error("useTranslator must be used inside <I18nProvider>");
  }
  return translator;
}
