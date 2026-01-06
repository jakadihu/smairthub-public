"use client";

import { useRouter, usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

type Props = {
  locale?: string;
};

export function LanguageSwitcher({ locale }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const lang = (locale ?? "hu").toUpperCase();

  const changeLang = (newLocale: string) => {
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
    router.replace(pathname);    
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
