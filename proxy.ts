import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, negotiateLocale } from "@/i18n/config";

/** `/` → `/en` or `/fr` (cookie, then `Accept-Language`, else `en`). */
export function proxy(request: NextRequest) {
  const locale = negotiateLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language"),
  );
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: "/",
};
