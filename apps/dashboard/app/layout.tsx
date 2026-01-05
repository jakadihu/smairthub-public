import "./globals.css";
import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@/components/ui/dialog";
import { LanguageSwitcher } from "@/components/language-switcher";

export const metadata = {
  title: "SmairtHub Dashboard",
  description: "Excel AI és adatkezelő platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hu">
      <body className="h-screen flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-white">
          <div className="p-6 text-2xl font-bold">SmairtHub</div>

          <nav className="flex-1 px-4 space-y-2">
            <Link href="/" className="block p-2 rounded hover:bg-gray-100">
              Dashboard
            </Link>
            <Link href="/excel" className="block p-2 rounded hover:bg-gray-100">
              Excel AI modul
            </Link>
            <Link
              href="/settings"
              className="block p-2 rounded hover:bg-gray-100"
            >
              Beállítások
            </Link>
          </nav>
        </aside>

        {/* Mobile sidebar */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden absolute top-4 left-4">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64 p-0">
            <VisuallyHidden>
              <DialogTitle>Mobil menü</DialogTitle>
            </VisuallyHidden>

            <div className="p-6 text-2xl font-bold">SmairtHub</div>

            <nav className="px-4 space-y-2">
              <Link href="/" className="block p-2 rounded hover:bg-gray-100">
                Dashboard
              </Link>
              <Link
                href="/excel"
                className="block p-2 rounded hover:bg-gray-100"
              >
                Excel AI modul
              </Link>
              <Link
                href="/settings"
                className="block p-2 rounded hover:bg-gray-100"
              >
                Beállítások
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="h-16 border-b bg-white flex items-center justify-between px-6">
            <h1 className="text-xl font-semibold">Dashboard</h1>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
