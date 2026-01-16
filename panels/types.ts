import type { LucideIcon } from "lucide-react"

export type LocaleCode = "hu" | "en";
export type PanelId = string;
export type PanelVisibility = "public" | "private" | "beta";

export type PanelPage = { 
  slug: string 
  label: string
  component: React.ComponentType<{ locale: string }> 
}

export interface PanelMeta {
  id: PanelId;
  slug: string; // URL-ben használt azonosító, pl. "excel-ai"

  name: Record<LocaleCode, string>;
  description: Record<LocaleCode, string>;

  tags: string[];
  category: "excel" | "automation" | "integration" | "other";

  premium: boolean;         // ingyenes vs fizetős
  featured: boolean;        // kiemelt modul a listában

  icon: LucideIcon;             // később: ikon neve / komponens kulcs
  order: number;            // rendezéshez

  visibility?: PanelVisibility; // pl. "beta" modulok elrejtése / jelölése

  component: React.ComponentType<{ locale: string }>

  pages: PanelPage[]
}
