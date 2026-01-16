"use client"

import { usePathname } from "next/navigation"
import { redirect } from "next/navigation"

export default function NotFound() {

    const pathname = usePathname()
    const locale = pathname.split("/")[1] || "hu"

  redirect(`/${locale}/404`)
}
