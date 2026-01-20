/**
 * A panel teljes életciklusának állapota.
 * 
 * upload → preview → clean → normalize → detectTypes → validate → summary
 */

export type PanelStage =
  | "idle"
  | "upload"
  | "preview"
  | "clean"
  | "normalize"
  | "detectTypes"
  | "validate"
  | "summary";

export const panelContextState = {
  stage: "idle" as PanelStage,
};

export function setPanelStage(stage: PanelStage) {
  panelContextState.stage = stage;
}
