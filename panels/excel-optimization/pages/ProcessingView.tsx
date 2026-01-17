"use client"

import { Loader2 } from "lucide-react"
import { Progress } from "@packages/ui/progress"
import { useI18n } from "../useI18n"

export default function ProcessingView({
  progress,
  locale,
}: {
  progress: number
  locale: string
}) {
  const t = useI18n(locale)

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />

      <div className="text-center space-y-2">
        <p className="text-lg font-medium">{t.processing}</p>

        <p className="text-sm text-muted-foreground">
          {progress < 30 && "1. Fájl beolvasása…"}
          {progress >= 30 && progress < 60 && "2. Adatok előkészítése…"}
          {progress >= 60 && progress < 90 && "3. Normalizálás…"}
          {progress >= 90 && "4. Befejezés…"}
        </p>
      </div>

      <Progress value={progress} className="w-64" />
    </div>
  )
}
