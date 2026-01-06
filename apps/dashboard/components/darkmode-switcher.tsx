"use client";

import { useRouter, usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher({ theme }: { theme: "light" | "dark" }) {
  const router = useRouter();
  const pathname = usePathname();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000`;

    // Valódi navigáció → SSR újraolvassa a cookie-t
    router.push(pathname);
  };

  return (
    <Button variant="outline" size="sm" onClick={toggleTheme}>
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
