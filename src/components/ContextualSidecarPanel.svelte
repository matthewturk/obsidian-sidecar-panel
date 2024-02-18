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
      let sidecarPanelMarkdown = "";
      $contextualSidecarPanelSetting.tagMaps.forEach(async ({ tag, panel }) => {
        // I don't like that this is quadratic.  But, it shouldn't be called that often.  Right?
        fileTags.forEach(async (tagCacheEntry) => {
          if (
            (tagCacheEntry.startsWith("#")
              ? tagCacheEntry.slice(1)
              : tagCacheEntry) == (tag.startsWith("#") ? tag.slice(1) : tag)
          ) {
            sidecarPanelMarkdown += await readSidecarPanel(panel, "/");
          }
        });
      });
      if (cache.frontmatter && cache.frontmatter["sidecar-panel"]) {
        let sidecarPanelTemplate = cache.frontmatter["sidecar-panel"];
        sidecarPanelMarkdown += await readSidecarPanel(
          sidecarPanelTemplate,
          "/"
        );
      }
      await MarkdownRenderer.render(
        app,
        sidecarPanelMarkdown,
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
