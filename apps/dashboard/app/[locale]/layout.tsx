import "../globals.css";
import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import "@smairthub/config/global-font.css";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@/components/ui/dialog";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/darkmode-switcher";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale } from "@smairthub/i18n";

export const metadata = {
  title: "SmairtHub Dashboard",
  description: "Excel AI és adatkezelő platform",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const cookieStore = await cookies();
  
  const resolvedParams = await params;
  const locale = resolvedParams.locale || defaultLocale;    
  const t = await getTranslations({ locale, namespace: "common" });

  const messages = { common: (await import(`../../messages/${locale}/common.json`)).default };

  const rawTheme = cookieStore.get("theme")?.value;
  const theme: "light" | "dark" =
    rawTheme === "dark" || rawTheme === "light" ? rawTheme : "light";    

  return (
    <html lang={locale} className={theme === "dark" ? "dark" : ""}>
      {/* Light: fehér háttér, Dark: fekete háttér */}
      <body className="min-h-screen bg-white dark:bg-black">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* OUTER WRAPPER → mobilon ad oldalsó teret */}
          <div className="px-3">
            {/* FULL DASHBOARD FRAME */}
            <div
              className="
                w-full max-w-[1600px]
                mx-auto my-5
                rounded-2xl border 
                bg-white dark:bg-black 
                overflow-hidden 
                flex flex-col md:flex-row
              "
            >
              {/* MOBILE TOPBAR */}
              <div className="md:hidden w-full p-4 border-b flex items-center justify-between bg-white dark:bg-black">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>

                  <SheetContent side="left" className="w-64 p-0">
                    <VisuallyHidden>
                      <DialogTitle>Mobil menü</DialogTitle>
                    </VisuallyHidden>

                    <div className="p-6 text-xl font-semibold tracking-tight">
                      <Link href="/" className="inline-block">
                        <Image
                          src={
                            theme === "dark" ? "/logo-dark.svg" : "/logo.svg"
                          }
                          alt="SmairtHub"
                          width={130}
                          height={30}
                          className="select-none"
                        />
                      </Link>
                    </div>

                    <nav className="px-4 space-y-1 text-sm">
                      <Link
                        href="/"
                        className="block px-3 py-2 rounded-md hover:bg-muted transition"
                      >
                        {t("nav.dashboard")}
                      </Link>
                      <Link
                        href="/excel"
                        className="block px-3 py-2 rounded-md hover:bg-muted transition"
                      >
                        Excel AI modul
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-3 py-2 rounded-md hover:bg-muted transition"
                      >
                        Beállítások
                      </Link>
                    </nav>
                  </SheetContent>
                </Sheet>

                <span className="text-lg font-semibold tracking-tight">
                  <Link href="/" className="inline-block">
                    <Image
                      src={theme === "dark" ? "/logo-dark.svg" : "/logo.svg"}
                      alt="SmairtHub"
                      width={130}
                      height={30}
                      className="select-none"
                    />
                  </Link>
                </span>
              </div>

              {/* DESKTOP SIDEBAR */}
              <aside className="hidden md:flex w-64 flex-col border-r bg-gray-50 dark:bg-black">
                <div className="h-16 flex items-center px-6 leading-none border-b border-gray-200 dark:border-gray-800">
                  <Link href="/" className="inline-block">
                    <Image
                      src={theme === "dark" ? "/logo-dark.svg" : "/logo.svg"}
                      alt="SmairtHub"
                      width={130}
                      height={30}
                      className="select-none"
                    />
                  </Link>
                </div>

                <nav className="flex-1 px-4 py-3 space-y-1 text-sm">
                  <Link
                    href="/"
                    className="block px-3 py-2 rounded-md hover:bg-muted transition"
                  >
                    {t("nav.dashboard")}
                  </Link>
                  <Link
                    href="/excel"
                    className="block px-3 py-2 rounded-md hover:bg-muted transition"
                  >
                    Excel AI modul
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 rounded-md hover:bg-muted transition"
                  >
                    Beállítások
                  </Link>
                </nav>
              </aside>

              {/* MAIN AREA */}
              <div className="flex-1 flex flex-col bg-white dark:bg-black">
                {/* TOPBAR */}
                <header className="hidden md:flex h-16 border-b items-center justify-between px-6 bg-white dark:bg-black">
                  <h1 className="text-lg font-medium tracking-tight">
                    Dashboard
                  </h1>

                  <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ThemeSwitcher theme={theme} />
                  </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-black">
                  <div className="max-w-screen-xl mx-auto">{children}</div>
                </main>
              </div>
            </div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
