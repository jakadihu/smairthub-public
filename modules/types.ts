import type { LucideIcon } from "lucide-react"

export type LocaleCode = "hu" | "en";
export type ModuleId = string;
export type ModuleVisibility = "public" | "private" | "beta";

export interface ModuleMeta {
  id: ModuleId;
  slug: string; // URL-ben használt azonosító, pl. "excel-ai"

  name: Record<LocaleCode, string>;
  description: Record<LocaleCode, string>;

  tags: string[];
  category: "excel" | "automation" | "integration" | "other";

  premium: boolean;         // ingyenes vs fizetős
  featured: boolean;        // kiemelt modul a listában

  icon: LucideIcon;             // később: ikon neve / komponens kulcs
  order: number;            // rendezéshez

  visibility?: ModuleVisibility; // pl. "beta" modulok elrejtése / jelölése

  component: React.ComponentType
}
