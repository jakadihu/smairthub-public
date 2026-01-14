import type { ModuleMeta } from "../types";
import { excelOptimizationModuleMeta } from "./meta";
import { ExcelOptimizationModule } from "./ui";
import type { LocaleCode } from "@smairthub/i18n";

export interface ModuleUIProps {
  locale: LocaleCode;
}

export interface ModuleDefinition {
  meta: ModuleMeta;
  Component: React.ComponentType<ModuleUIProps>;
}

export const excelOptimizationModule: ModuleDefinition = {
  meta: excelOptimizationModuleMeta,
  Component: ExcelOptimizationModule,
};
