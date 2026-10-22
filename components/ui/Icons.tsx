import type { ComponentPropsWithRef, ReactNode } from "react";

type IconProps = ComponentPropsWithRef<"svg">;

/** Inline SVG from the artifact: decorative, drawn in `currentColor`. */
function icon(size: number, strokeWidth: number, paths: ReactNode, join = false) {
  return function Icon(props: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin={join ? "round" : undefined}
        aria-hidden="true"
        focusable="false"
        {...props}
      >
        {paths}
      </svg>
    );
  };
}

export const TipIcon = icon(
  16,
  2,
  <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z" />,
);

export const CloseIcon = icon(14, 2.2, <path d="M6 6l12 12M18 6L6 18" />);

export const SearchIcon = icon(
  16,
  2,
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </>,
);

export const DownloadIcon = icon(
  20,
  2,
  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />,
  true,
);

export const UploadIcon = icon(
  20,
  2,
  <path d="M12 15V3M7 8l5-5 5 5M5 21h14" />,
  true,
);

export const SheetIcon = icon(
  20,
  2,
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M3 15h18M9 4v16" />
  </>,
);

export const FileIcon = icon(
  18,
  2,
  <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5" />,
  true,
);

export const ChevronDownIcon = icon(14, 2.2, <path d="M6 9l6 6 6-6" />, true);
