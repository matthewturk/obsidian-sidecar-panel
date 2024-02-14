import { writable } from "svelte/store";
import type ContextualSidecarPanel from "./main";
import { type TFile} from "obsidian";

export const currentFile = writable<TFile | null>();