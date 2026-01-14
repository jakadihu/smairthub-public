import type { ModuleMeta } from "../types";
import { excelOptimizationModuleMeta } from "./meta";
import { ExcelOptimizationModule } from "./ui";

export interface ModuleDefinition {
  meta: ModuleMeta;
  Component: React.ComponentType;
}

export const excelOptimizationModule: ModuleDefinition = {
  meta: excelOptimizationModuleMeta,
  Component: ExcelOptimizationModule,
};
