"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@packages/ui/dropdown-menu";
import { Button } from "@packages/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  // A locale-t mindig a URL-ből olvassuk ki
  const currentLocale = pathname.split("/")[1] || "hu";

  const switchLanguage = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    const segments = pathname.split("/");
    segments[1] = newLocale;

    const newPath = segments.join("/");

    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;

    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {currentLocale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchLanguage("hu")}>
          🇭🇺 Magyar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLanguage("en")}>
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
