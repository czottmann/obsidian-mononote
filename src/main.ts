import { MarkdownView, Plugin, TFile } from "obsidian";
import { PLUGIN_INFO } from "./plugin-info";

export default class Mononote extends Plugin {
  async onload() {
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(
        this.app.workspace.on("file-open", this.onFileOpen),
      );
      console.log(`Plugin Mononote v${PLUGIN_INFO.pluginVersion} initialized`);
    });
  }

  onunload() {
    console.log(`Plugin Mononote v${PLUGIN_INFO.pluginVersion} unloaded`);
  }

  private onFileOpen = async (file: TFile | null) => {
    const { workspace } = this.app;

    if (!file) {
      return;
    }

    // Find all leaves which have the same note as the one that was just opened
    let dupeLeaves = workspace.getLeavesOfType("markdown")
      .filter((leaf) => leaf.view.getState().file === file.path);

    // No duplicates, nothing to do
    if (dupeLeaves.length < 2) {
      return;
    }

    // Get reference to active leaf
    const activeLeaf = workspace.getActiveViewOfType(MarkdownView)?.leaf;
    // This shouldn't happen, but better be safe than explodey
    if (!activeLeaf) {
      return;
    }

    // If the active leaf has a history, go back in history. Otherwise, close it
    const leafWithHistory = activeLeaf as any;
    if (leafWithHistory.history.backHistory.length) {
      await leafWithHistory.history.back();
    } else {
      if (!(activeLeaf as any).pinned) {
        activeLeaf.detach();
      }
    }

    // Focus the first duplicate leaf
    const firstDuplicateLeaf = dupeLeaves.find((leaf) => leaf != activeLeaf)!;
    workspace.setActiveLeaf(firstDuplicateLeaf, { focus: true });
  };
}
