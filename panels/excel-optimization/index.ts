import type { PanelMeta } from "../types";
import { excelOptimizationPanelMeta } from "./meta";
import { ExcelOptimizationPanel } from "./ui";
import type { LocaleCode } from "@smairthub/i18n";

export interface PanelUIProps {
  locale: LocaleCode;
}

export interface PanelDefinition {
  meta: PanelMeta;
  Component: React.ComponentType<PanelUIProps>;
}

export const excelOptimizationModule: PanelDefinition = {
  meta: excelOptimizationPanelMeta,
  Component: ExcelOptimizationPanel,
};
