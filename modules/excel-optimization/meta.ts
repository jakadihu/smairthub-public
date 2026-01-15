import { Sheet } from "lucide-react"
import type { ModuleMeta } from "@modules/types";
import { ExcelOptimizationRoot } from "./components/ExcelOptimizationRoot"

export const excelOptimizationModuleMeta: ModuleMeta = {
  id: "excel-optimization",
  slug: "excel-optimization",

  name: {
    hu: "Excel optimalizálás",
    en: "Excel optimization",
  },

  description: {
    hu: "Excel fájlok tisztítása, normalizálása és AI-alapú elemzése.",
    en: "Clean, normalize and analyze Excel files with AI.",
  },

  tags: ["excel", "ai", "adatkezelés", "automatizálás"],
  category: "excel",

  premium: false,
  featured: true,

  icon: Sheet,
  order: 10,

  visibility: "public",

  component: ExcelOptimizationRoot,
};
