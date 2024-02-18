<script lang="ts">
  import {
    App,
    MarkdownRenderer,
    Component,
    TFile,
    getAllTags,
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
    if (destination) destination.innerHTML = "";
    let cache = app.metadataCache.getFileCache(file);

    if (cache) {
      const fileTags = getAllTags(cache) || [];
      let sidecarPanelMarkdown: string[] = [];
      for (const { tag, panel } of $contextualSidecarPanelSetting.tagMaps) {
        // I don't like that this is quadratic.  But, it shouldn't be called that often.  Right?
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
