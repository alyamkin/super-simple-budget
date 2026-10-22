import type { MetadataRoute } from "next";
import { en } from "@/i18n/dictionaries/en";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: en.app.name,
    short_name: "Budget",
    description: en.meta.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f3f6f7",
    theme_color: "#0d6b73",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
