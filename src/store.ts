import { writable } from "svelte/store";
import { type ContextualSidecarPanelSettings, DEFAULT_SETTINGS } from "./types";
import { type TFile } from "obsidian";

export const currentFile = writable<TFile | null>();
export const contextualSidecarPanelSetting =
  writable<ContextualSidecarPanelSettings>(DEFAULT_SETTINGS);
