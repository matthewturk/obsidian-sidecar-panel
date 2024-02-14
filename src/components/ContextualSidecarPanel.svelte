<script lang="ts">
  import { App, MarkdownRenderer, Component, TFile } from "obsidian";
  import { onMount } from "svelte";
  import { currentFile } from "../store";
  let destination: HTMLElement;
  export let app: App;
  export let parent: Component;

  onMount(() => {
    currentFile.subscribe(async (file) => {
      if (!file) return;
      destination.innerHTML = "";
      let cache = app.metadataCache.getFileCache(file);
      if (cache && cache.frontmatter && cache.frontmatter["sidecar-panel"]) {
        let sidecarPanelTemplate = cache.frontmatter["sidecar-panel"];
        console.log(sidecarPanelTemplate);
        sidecarPanelTemplate = sidecarPanelTemplate.startsWith("[[")
          ? sidecarPanelTemplate.substring(2, sidecarPanelTemplate.length - 2)
          : sidecarPanelTemplate;
        let sidecarPanelTemplateFile = app.metadataCache.getFirstLinkpathDest(
          sidecarPanelTemplate,
          file.path
        );
        if (
          !sidecarPanelTemplateFile ||
          !(sidecarPanelTemplateFile instanceof TFile)
        )
          return;
        let sidecarPanelMarkdown = await app.vault.cachedRead(
          sidecarPanelTemplateFile
        );
        MarkdownRenderer.render(
          app,
          sidecarPanelMarkdown,
          destination,
          file.path,
          parent
        );
      }
    });
  });
</script>

<div class="break-words" bind:this={destination}></div>
