export interface ContextualSidecarPanelSettings {
	defaultPanel: string;
	alwaysUseDefaultPanel: boolean;
	tagMaps: { tag: string; panel: string }[];
}
export const DEFAULT_SETTINGS: ContextualSidecarPanelSettings = {
	defaultPanel: "",
	alwaysUseDefaultPanel: false,
	tagMaps: [],
};
