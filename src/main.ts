import { Plugin, MarkdownRenderer } from "obsidian";
import {
  ContextualSidecarPanelView,
  VIEW_TYPE_CONTEXTUAL_SIDECAR,
} from "./views/ContextualSidecarPanelView";
import "virtual:uno.css";
import { currentFile } from "./store";

interface ContextualSidecarPanelSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: ContextualSidecarPanelSettings = {
  mySetting: "default",
};

export default class ContextualSidecarPanel extends Plugin {
  settings!: ContextualSidecarPanelSettings;

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async onload() {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_CONTEXTUAL_SIDECAR,
      (leaf) => new ContextualSidecarPanelView(leaf)
    );

	
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
		currentFile.set(file);
      })
    );
    this.addRibbonIcon("dice", "Activate view", () => {
      this.activateView();
    });
  }

  onunload() {
  }

  async activateView() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_CONTEXTUAL_SIDECAR);

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: VIEW_TYPE_CONTEXTUAL_SIDECAR,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(VIEW_TYPE_CONTEXTUAL_SIDECAR)[0]
    );
  }
}
