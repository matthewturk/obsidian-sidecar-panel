<script lang="ts">
  import {
    type App,
    MarkdownRenderer,
    type Component,
    TFile,
    getAllTags,
    normalizePath,
  } from "obsidian";
  import { onMount } from "svelte";
  import { currentFile, contextualSidecarPanelSetting } from "../store";
  let destination: HTMLElement;
  export let app: App;
  export let parent: Component;

  async function readSidecarPanel(panelName: string, basePath: string) {
    panelName = panelName.startsWith("[[")
      ? panelName.substring(2, panelName.length - 2)
      : panelName;
    let panelFile = app.metadataCache.getFirstLinkpathDest(panelName, basePath);
    if (!panelFile || !(panelFile instanceof TFile)) {
      return "";
    }
    return await app.vault.cachedRead(panelFile);
  }

  async function updateSidecarPanel(file: TFile | null) {
    if (!file) return;
    if (destination) destination.empty();
    let cache = app.metadataCache.getFileCache(file);
    if (
      $contextualSidecarPanelSetting.blockList.some(
        (block) => file.basename === block
      )
    ) {
      return;
    }

    if (cache) {
      const fileTags = getAllTags(cache) || [];
      let sidecarPanelMarkdown: string[] = [];
      // If the default panel is set, and the file doesn't have a sidecar-panel, or the alwaysUseDefaultPanel is set, then use the default panel.
      if ($contextualSidecarPanelSetting.defaultPanel !== "") {
        if (
          $contextualSidecarPanelSetting.alwaysUseDefaultPanel ||
          !(cache.frontmatter && cache.frontmatter["sidecar-panel"])
        ) {
          sidecarPanelMarkdown.push(
            await readSidecarPanel(
              $contextualSidecarPanelSetting.defaultPanel,
              "/"
            )
          );
        }
      }
      // I don't like that these are quadratic.  But, it shouldn't be called that often.  Right?
      for (const {
        folder,
        panel,
      } of $contextualSidecarPanelSetting.folderMaps) {
        const normalizedFolderPath = normalizePath(folder);
        const normalizedFilePath = normalizePath(file.path);
        if (normalizedFilePath.startsWith(normalizedFolderPath)) {
          // We still read from the root, because the panel might be in a different folder.
          sidecarPanelMarkdown.push(await readSidecarPanel(panel, "/"));
        }
      }
      for (const { tag, panel } of $contextualSidecarPanelSetting.tagMaps) {
        const normalizedTag = tag.startsWith("#") ? tag.slice(1) : tag;
        for (const tagCacheEntry of fileTags) {
          const normalizedEntry = tagCacheEntry.startsWith("#")
            ? tagCacheEntry.slice(1)
            : tagCacheEntry;
          if (
            normalizedEntry == normalizedTag ||
            normalizedEntry.startsWith(`${normalizedTag}/`)
          ) {
            sidecarPanelMarkdown.push(await readSidecarPanel(panel, "/"));
          }
        }
      }
      if (cache.frontmatter && cache.frontmatter["sidecar-panel"]) {
        sidecarPanelMarkdown.push(
          await readSidecarPanel(cache.frontmatter["sidecar-panel"], "/")
        );
      }
      await MarkdownRenderer.render(
        app,
        sidecarPanelMarkdown.join("\n"),
        destination,
        file.path,
        parent
      );
    }
  }

  onMount(() => {
    currentFile.subscribe(updateSidecarPanel);
    contextualSidecarPanelSetting.subscribe(() => {
      updateSidecarPanel($currentFile);
    });
  });
</script>

<div class="break-words" bind:this={destination}></div>
