<script lang="ts">
  import { App, TFile } from "obsidian";
  let svelteUrl = "https://svelte.dev/";
  let tailwindcssUrl = "https://tailwindcss.com/";
  let input: string = "";
  import { currentFile } from "../store";
  let _currentFile: TFile | null = null;
  let sidecarPanelTemplate: string = "";
  export let app: App;
  currentFile.subscribe((file) => {
    if (!file) return;
    let cache = app.metadataCache.getFileCache(file);
    if (cache && cache.frontmatter) {
      sidecarPanelTemplate = cache.frontmatter["sidecar-panel"];
    }
  });
</script>

<div class="break-words">
  <h1 class="">Example View</h1>
  <p>
    This is an example of an Obsidian View made with <a href={svelteUrl}
      >Svelte</a
    >
    and <a href={tailwindcssUrl}>Tailwindcss</a>.
  </p>

  <h2>Reactivity</h2>
  <h3>Input</h3>
  <input
    type="text"
    placeholder="Write here"
    maxlength="115"
    bind:value={input}
  />
  <p>CurrentFile: {_currentFile?.name}</p>
  <p>sidecarPanelTemplate: {sidecarPanelTemplate}</p>
  <p>Input: {input}</p>
</div>
