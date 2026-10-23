import { FileMenu } from "@/features/files/components/FileMenu";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { LanguageLink } from "./LanguageLink";

/** The brand mark from the artifact; its colours are fixed, not theme tokens. */
function BrandMark() {
  return (
    <svg
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
      className="block size-10 flex-none"
    >
      <rect width="512" height="512" rx="112" fill="#0d6b73" />
      <path d="M244 280 L244 140 A140 140 0 1 0 384 280 Z" fill="#fff" />
      <path d="M270 254 L270 114 A140 140 0 0 1 410 254 Z" fill="#a9e4c3" />
    </svg>
  );
}

/**
 * App name, subtitle, the File menu, the theme toggle and the language link.
 * Server-rendered around the client controls.
 */
export function Header({ app }: { app: Dictionary["app"] }) {
  return (
    <header className="relative mb-2 flex flex-wrap items-center justify-between gap-3 pb-4 max-phone:flex-nowrap">
      <div className="flex items-center gap-3 max-phone:min-w-0 max-phone:flex-1">
        <BrandMark />
        <div className="min-w-0">
          <h1 className="text-[1.3rem] font-bold max-phone:text-[1.15rem]">
            {app.name}
          </h1>
          <p className="m-0 text-[.85rem] text-muted max-phone:hidden">
            {app.subtitle}
          </p>
        </div>
      </div>
      <div className="flex flex-none items-center gap-2">
        <FileMenu />
        <ThemeToggle className="btn inline-flex items-center border-line bg-transparent px-2.5 text-accent hover:border-accent max-phone:min-h-10 max-phone:px-2" />
        <LanguageLink className="btn inline-flex items-center border-line bg-transparent px-2 text-accent hover:border-accent max-phone:min-h-10 max-phone:px-3" />
      </div>
    </header>
  );
}
