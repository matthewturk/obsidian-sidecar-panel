export interface ContextualSidecarPanelSettings {
	tagMaps: { tag: string; panel: string }[];
}
export const DEFAULT_SETTINGS: ContextualSidecarPanelSettings = {
	tagMaps: [],
};
