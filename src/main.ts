import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import {
  ContextualSidecarPanelView,
  VIEW_TYPE_CONTEXTUAL_SIDECAR,
} from "./views/ContextualSidecarPanelView";
import "virtual:uno.css";
import { contextualSidecarPanelSetting, currentFile } from "./store";
import { type ContextualSidecarPanelSettings, DEFAULT_SETTINGS } from "./types";

export default class ContextualSidecarPanel extends Plugin {
  settings!: ContextualSidecarPanelSettings;

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    contextualSidecarPanelSetting.set(this.settings);
    await this.saveData(this.settings);
  }

  async onload() {
    await this.loadSettings();
    contextualSidecarPanelSetting.set(this.settings);

    this.registerView(
      VIEW_TYPE_CONTEXTUAL_SIDECAR,
      (leaf) => new ContextualSidecarPanelView(leaf)
    );

    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        currentFile.set(file);
      })
    );
    this.addCommand({
      id: "activate-contextual-sidecar",
      name: "Activate Contextual Sidecar",
      callback: () => this.activateView(),
    });
    this.addSettingTab(new ContextualSidecarPanelSettingTab(this.app, this));
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_CONTEXTUAL_SIDECAR);
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

class ContextualSidecarPanelSettingTab extends PluginSettingTab {
  plugin: ContextualSidecarPanel;
  constructor(app: App, plugin: ContextualSidecarPanel) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display(): void {
    let { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", {
      text: "Settings for Contextual Sidecar Panel",
    });

    // Some of this logic was inspired by the bwydoogh/obsidian-force-view-mode-of-note plugin.

    new Setting(this.containerEl)
      .setDesc("Add new tag map")
      .addButton((button) => {
        button
          .setTooltip("Add another tag to map to a panel")
          .setButtonText("+")
          .setCta()
          .onClick(async () => {
            this.plugin.settings.tagMaps.push({
              tag: "",
              panel: "",
            });
            await this.plugin.saveSettings();
            this.display();
          });
      });

    this.plugin.settings.tagMaps.forEach(({ tag, panel }, index) => {
      const div = containerEl.createEl("div");

      const s = new Setting(this.containerEl)
        .addSearch((cb) => {
          cb.setPlaceholder("Example: #daily-note")
            .setValue(tag)
            .onChange(async (newTag) => {
              if (
                newTag &&
                this.plugin.settings.tagMaps.some((e) => e.tag == newTag)
              ) {
                console.error(
                  "ForceViewMode: This tag is already associated with a panel: ",
                  newTag
                );

                return;
              }

              this.plugin.settings.tagMaps[index].tag = newTag;

              await this.plugin.saveSettings();
            });
        })
        .addSearch((cb) => {
          cb.setPlaceholder("Example: daily-note-panel")
            .setValue(panel)
            .onChange(async (newPanel) => {
              if (
                newPanel &&
                this.plugin.settings.tagMaps.some((e) => e.tag == newPanel)
              ) {
                console.error(
                  "ForceViewMode: This tag already has a panel associated with",
                  newPanel
                );

                return;
              }

              this.plugin.settings.tagMaps[index].panel = newPanel;

              await this.plugin.saveSettings();
            });
        })
        .addExtraButton((cb) => {
          cb.setIcon("cross")
            .setTooltip("Delete")
            .onClick(async () => {
              this.plugin.settings.tagMaps.splice(index, 1);

              await this.plugin.saveSettings();

              this.display();
            });
        });

      s.infoEl.remove();

      div.appendChild(containerEl.lastChild as Node);
    });
  }
}
