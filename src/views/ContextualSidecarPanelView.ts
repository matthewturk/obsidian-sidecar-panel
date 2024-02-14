import { ItemView, TFile } from "obsidian";

import Component from "../components/ContextualSidecarPanel.svelte";

export const VIEW_TYPE_CONTEXTUAL_SIDECAR = "contextual-sidecar";

export class ContextualSidecarPanelView extends ItemView {
	component!: Component;
	currentFile: TFile | undefined;

	getViewType() {
		return VIEW_TYPE_CONTEXTUAL_SIDECAR;
	}

	getDisplayText() {
		return "Sidecar Panel View";
	}

	async onOpen() {
		this.component = new Component({
			target: this.contentEl,
			props: {
				app: this.app,
				parent: this,
			},
		});
	}

	async onClose() {
		this.component.$destroy();
	}
}
