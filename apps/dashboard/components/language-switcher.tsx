"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

type Props = {
  locale?: string; // legyen optional
};

export function LanguageSwitcher({ locale }: Props) {
  const router = useRouter();

  // Biztonságos inicializálás
  const initial = (locale ?? "hu").toUpperCase();

  const [lang, setLang] = useState(initial);

  const changeLang = (newLocale: string) => {
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
    setLang(newLocale.toUpperCase());
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {lang}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLang("hu")}>🇭🇺 Magyar</DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLang("en")}>🇬🇧 English</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
