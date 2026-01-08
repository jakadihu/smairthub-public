"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher({ theme: initialTheme }: { theme: "light" | "dark" }) {
  const router = useRouter();
  const pathname = usePathname();

  // Saját state → ikon azonnal vált
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";

    // Cookie frissítése
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000`;

    // Ikon azonnal vált
    setTheme(newTheme);

    // SSR újraolvassa a cookie-t → <html class="dark"> frissül
    router.refresh();
  };

  return (
    <Button variant="outline" size="sm" onClick={toggleTheme}>
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
