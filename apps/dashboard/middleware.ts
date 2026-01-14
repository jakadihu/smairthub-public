import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, isLocale } from "@smairthub/i18n";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Ha már locale-os útvonalon vagyunk → mehet tovább
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (!pathnameIsMissingLocale) {
    return NextResponse.next();
  }

  // 2) Böngésző nyelv felismerése
  const acceptLang = request.headers.get("accept-language") || "";
  const browserLang = acceptLang.split(",")[0].split("-")[0];
  const detectedLocale = isLocale(browserLang) ? browserLang : defaultLocale;

  // 3) Átirányítás locale-os útvonalra
  const redirectUrl = new URL(`/${detectedLocale}${pathname}`, request.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.webp).*)",
  ],
};

