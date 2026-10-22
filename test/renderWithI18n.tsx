import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import type { Locale } from "@/i18n/config";
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";
import { I18nProvider } from "@/i18n/I18nProvider";

const DICTIONARIES = { en, fr };

/** Renders `ui` inside an {@link I18nProvider} for `locale` (default `en`). */
export function renderWithI18n(
  ui: ReactElement,
  { locale = "en", ...options }: RenderOptions & { locale?: Locale } = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <I18nProvider locale={locale} dictionary={DICTIONARIES[locale]}>
        {children}
      </I18nProvider>
    ),
    ...options,
  });
}
