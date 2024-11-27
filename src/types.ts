export interface ContextualSidecarPanelSettings {
  defaultPanel: string;
  alwaysUseDefaultPanel: boolean;
  tagMaps: { tag: string; panel: string }[];
  folderMaps: { folder: string; panel: string }[];
  blockList: string[];
}
export const DEFAULT_SETTINGS: ContextualSidecarPanelSettings = {
  defaultPanel: "",
  alwaysUseDefaultPanel: false,
  tagMaps: [],
  folderMaps: [],
  blockList: [],
};
