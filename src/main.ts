import { App, Plugin, PluginSettingTab, Setting, TFolder } from "obsidian";
import {
  ContextualSidecarPanelView,
  VIEW_TYPE_CONTEXTUAL_SIDECAR,
} from "./views/ContextualSidecarPanelView";
import "virtual:uno.css";
import { FolderInputSuggest } from "obsidian-utilities";
import { contextualSidecarPanelSetting, currentFile } from "./store";
import { type ContextualSidecarPanelSettings, DEFAULT_SETTINGS } from "./types";
import { get } from "svelte/store";

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
        if (file !== null) {
          currentFile.set(file);
        }
      })
    );
    this.addCommand({
      id: "activate-panel",
      name: "Activate Panel",
      callback: () => this.activateView(),
    });
    this.addSettingTab(new ContextualSidecarPanelSettingTab(this.app, this));
    this.app.workspace.onLayoutReady(async () => {
      // obsidian rss reader inspired this
      if (
        this.app.workspace.getLeavesOfType(VIEW_TYPE_CONTEXTUAL_SIDECAR)
          .length > 0
      ) {
        return;
      }
      await this.app.workspace.getRightLeaf(false).setViewState({
        type: VIEW_TYPE_CONTEXTUAL_SIDECAR,
      });
    });
  }

  async activateView() {
    if (
      this.app.workspace.getLeavesOfType(VIEW_TYPE_CONTEXTUAL_SIDECAR).length >
      0
    ) {
      await this.app.workspace.getRightLeaf(false).setViewState({
        type: VIEW_TYPE_CONTEXTUAL_SIDECAR,
        active: true,
      });
    }

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(VIEW_TYPE_CONTEXTUAL_SIDECAR)[0]
    );
  }

  async getCurrentFile() {
    return get(currentFile);
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

    // Some of this logic was inspired by the bwydoogh/obsidian-force-view-mode-of-note plugin.

    new Setting(this.containerEl)
      .setName("Default Panel")
      .setDesc(
        "Specify a default sidebar panel file, if none is set in the frontmatter."
      )
      .addSearch((cb) => {
        cb.setPlaceholder("Example: daily-note-panel")
          .setValue(this.plugin.settings.defaultPanel)
          .onChange(async (newPanel) => {
            this.plugin.settings.defaultPanel = newPanel;
            await this.plugin.saveSettings();
          });
      });
    new Setting(this.containerEl)
      .setName("Always use default panel?")
      .setDesc(
        "If checked, the default panel will be used for all files, even if one is specified in the frontmatter."
      )
      .addToggle((cb) => {
        cb.setValue(this.plugin.settings.alwaysUseDefaultPanel).onChange(
          async (value) => {
            this.plugin.settings.alwaysUseDefaultPanel = value;
            await this.plugin.saveSettings();
          }
        );
      });

    new Setting(this.containerEl).setDesc(
      "Specify a sidecar panel for all files within a given folder.  These will be applied in order, before tag mappings."
    );
    new Setting(this.containerEl)
      .setDesc("Add new folder map")
      .addButton((button) => {
        button
          .setTooltip("Add another folder to map to a panel")
          .setButtonText("+")
          .setCta()
          .onClick(async () => {
            this.plugin.settings.folderMaps.push({
              folder: "",
              panel: "",
            });
            await this.plugin.saveSettings();
            this.display();
          });
      });

    this.plugin.settings.folderMaps.forEach(({ folder, panel }, index) => {
      const div = containerEl.createEl("div");
      const s = new Setting(this.containerEl)
        .addSearch((cb) => {
          const folders: TFolder[] = this.app.vault
            .getAllLoadedFiles()
            .filter<TFolder>((f) => f instanceof TFolder);
          const modal = new FolderInputSuggest(this.app, cb, folders);
          modal.onSelect(({ item }) => {
            cb.setValue(item.path);
            cb.inputEl.trigger("input");
            modal.close();
          });

          cb.setPlaceholder("Example: /templates/")
            .setValue(folder)
            .onChange(async (newFolder) => {
              if (
                newFolder &&
                this.plugin.settings.folderMaps.some(
                  (e) => e.folder == newFolder
                )
              ) {
                console.error(
                  "ForceViewMode: This folder is already associated with a panel: ",
                  newFolder
                );

                return;
              }

              this.plugin.settings.folderMaps[index].folder = newFolder;

              await this.plugin.saveSettings();
            });
        })
        .addSearch((cb) => {
          cb.setPlaceholder("Example: template-panel")
            .setValue(panel)
            .onChange(async (newPanel) => {
              this.plugin.settings.folderMaps[index].panel = newPanel;

              await this.plugin.saveSettings();
            });
        })
        .addExtraButton((cb) => {
          cb.setIcon("cross")
            .setTooltip("Delete")
            .onClick(async () => {
              this.plugin.settings.folderMaps.splice(index, 1);

              await this.plugin.saveSettings();

              this.display();
            });
        });

      new Setting(this.containerEl).setDesc(
        "Specify a sidecar panel for all files with a given tag.  These will be applied in order."
      );
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
    });

    new Setting(this.containerEl).setDesc(
      "Deactivate sidecar for specific files."
    );
    new Setting(this.containerEl)
      .setDesc("Add new blocked file")
      .addButton((button) => {
        button
          .setTooltip(
            "Add another file to the list of those that will not " +
              "activate a sidecar.  All files with this name, " +
              "regardless of folder, will be blocked."
          )
          .setButtonText("+")
          .setCta()
          .onClick(async () => {
            this.plugin.settings.blockList.push([]);
            await this.plugin.saveSettings();
            this.display();
          });
      });

    this.plugin.settings.blockList.forEach((fn, index) => {
      const div = containerEl.createEl("div");
      const s = new Setting(this.containerEl)
        .addSearch((cb) => {
          cb.setPlaceholder("Example: a-special-note")
            .setValue(fn)
            .onChange(async (newFn) => {
              this.plugin.settings.blockList[index] = newFn;
              await this.plugin.saveSettings();
            });
        })
        .addExtraButton((cb) => {
          cb.setIcon("cross")
            .setTooltip("Delete")
            .onClick(async () => {
              this.plugin.settings.blockList.splice(index, 1);

              await this.plugin.saveSettings();

              this.display();
            });
        });
    });
  }
}
