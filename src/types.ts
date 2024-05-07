export interface ContextualSidecarPanelSettings {
  defaultPanel: string;
  alwaysUseDefaultPanel: boolean;
  tagMaps: { tag: string; panel: string }[];
  blockList: string[];
}
export const DEFAULT_SETTINGS: ContextualSidecarPanelSettings = {
  defaultPanel: "",
  alwaysUseDefaultPanel: false,
  tagMaps: [],
  blockList: [],
};
