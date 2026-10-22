import { ImageResponse } from "next/og";
import { defaultLocale, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";

const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ lang: string }> };

async function dictionaryFor(params: Props["params"]) {
  const { lang } = await params;
  return getDictionary(hasLocale(lang) ? lang : defaultLocale);
}

/** One card per locale, so its alt text is localised too. */
export async function generateImageMetadata({ params }: Props) {
  const { meta } = await dictionaryFor(params);
  return [{ id: "card", alt: meta.title, size, contentType: "image/png" }];
}

/** 1200×630 share card: brand mark, localised name and subtitle. */
export default async function OpenGraphImage({ params }: Props) {
  const { app } = await dictionaryFor(params);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "#f3f6f7",
          color: "#132a30",
        }}
      >
        <svg width="160" height="160" viewBox="0 0 512 512">
          <rect width="512" height="512" rx="112" fill="#0d6b73" />
          <path d="M244 280 L244 140 A140 140 0 1 0 384 280 Z" fill="#fff" />
          <path d="M270 254 L270 114 A140 140 0 0 1 410 254 Z" fill="#a9e4c3" />
        </svg>
        <div style={{ marginTop: 56, fontSize: 84, fontWeight: 700 }}>
          {app.name}
        </div>
        <div style={{ marginTop: 16, fontSize: 40, color: "#5a6f75" }}>
          {app.subtitle}
        </div>
      </div>
    ),
    size,
  );
}
