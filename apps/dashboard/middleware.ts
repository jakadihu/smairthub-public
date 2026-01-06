import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, isLocale } from "./i18n";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1) Ha már van locale cookie → kész
  const cookieLocale = request.cookies.get("locale")?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return response;
  }

  // 2) Böngésző nyelv felismerése
  const acceptLang = request.headers.get("accept-language") || "";
  const browserLang = acceptLang.split(",")[0].split("-")[0];

  const detectedLocale = isLocale(browserLang) ? browserLang : defaultLocale;

  // 3) Cookie beállítása
  response.cookies.set("locale", detectedLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
