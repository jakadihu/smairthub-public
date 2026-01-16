"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"

export default function ModuleNotFound() {
  const t = useTranslations("common")
  const pathname = usePathname()

  const locale = pathname.split("/")[1] || "hu"

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <Card className="max-w-md w-full border-none shadow-none">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            {t("404.title")}
          </h1>

          <p className="text-muted-foreground">
            {t("404.description")}
          </p>

          <Button asChild className="mt-2">
            <a href={`/${locale}`}>{t("404.backToDashboard")}</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
