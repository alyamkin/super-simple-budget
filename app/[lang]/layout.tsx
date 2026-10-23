import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { notFound } from "next/navigation";
import {
  Atkinson_Hyperlegible,
  Bricolage_Grotesque,
  IBM_Plex_Mono,
} from "next/font/google";
import { localeMetadata } from "@/features/seo/metadata";
import { themeScript } from "@/features/theme/theme";
import { ThemeSync } from "@/features/theme/ThemeSync";
import { hasLocale, locales, regionalLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { I18nProvider } from "@/i18n/I18nProvider";
import { StoreProvider } from "@/store/StoreProvider";
import "../globals.css";

// `subsets` only picks what is preloaded: the latin-ext faces (e.g. "œ") are
// still declared and download on demand through their unicode-range.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: "500",
  display: "swap",
  // Numbers only; not worth competing with the page text for bandwidth.
  preload: false,
});

// `dynamicParams = false` is not allowed with Cache Components; unknown
// locales 404 through the `hasLocale` guard below instead.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return localeMetadata(lang, await getDictionary(lang));
}

export { viewport } from "@/features/seo/metadata";

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);

  return (
    // `themeScript` sets `data-theme` before React hydrates.
    <html
      suppressHydrationWarning
      lang={regionalLocale(lang)}
      className={`${bricolage.variable} ${atkinson.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeSync />
        <I18nProvider locale={lang} dictionary={dictionary}>
          <StoreProvider>{children}</StoreProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
