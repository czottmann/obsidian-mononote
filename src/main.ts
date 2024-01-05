import { MarkdownView, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { PLUGIN_INFO } from "./plugin-info";

export default class Mononote extends Plugin {
  async onload() {
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(
        this.app.workspace.on("active-leaf-change", this.onActiveLeafChange),
      );
      this.registerEvent(
        this.app.workspace.on("file-open", this.onFileOpen),
      );
      console.log(`Plugin Mononote v${PLUGIN_INFO.pluginVersion} initialized`);
    });
  }

  onunload() {
    console.log(`Plugin Mononote v${PLUGIN_INFO.pluginVersion} unloaded`);
  }

  private onActiveLeafChange = async (activeLeaf: WorkspaceLeaf | null) => {
    const { workspace } = this.app;
    const filePath = activeLeaf?.view.getState().file;
    if (!filePath) return;

    const viewType = activeLeaf?.view.getViewType();
    const isActiveLeafPinned = (activeLeaf as any).pinned;

    // Find all unpinned leaves of the same type which show the same file as the
    // one in the active leaf. This list excludes the active leaf.
    let unpinnedDupes = workspace.getLeavesOfType(viewType)
      .filter((l) =>
        l !== activeLeaf &&
        l.view?.getState().file === filePath &&
        !(l as any).pinned
      );

    // Find all pinned leaves of the same type which show the same file as the
    // one in the active leaf. This list excludes the active leaf.
    let pinnedDupes = workspace.getLeavesOfType(viewType)
      .filter((l) =>
        l !== activeLeaf &&
        l.view?.getState().file === filePath &&
        (l as any).pinned
      );

    // Close all unpinned duplicate leaves
    unpinnedDupes.forEach((l) => l.detach());

    // If none of the pinned leaves is the active one yet, focus the first
    // pinned dupe. This will make Obsidian trigger the `active-leaf-change`
    // event again, so we'll be back here in a moment.
    if (pinnedDupes.length && !isActiveLeafPinned) {
      workspace.setActiveLeaf(pinnedDupes[0], { focus: true });
    }
  };

  private onFileOpen = async (file: TFile | null) => {
    const { workspace } = this.app;
    if (!file) return;

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
    const isActiveLeafPinned = (activeLeaf as any).pinned;
    if (leafWithHistory.history.backHistory.length) {
      await leafWithHistory.history.back();
    } else if (!isActiveLeafPinned) {
      activeLeaf.detach();
    }

    // Focus the first duplicate leaf
    const firstDuplicateLeaf = dupeLeaves.find((leaf) => leaf !== activeLeaf)!;
    workspace.setActiveLeaf(firstDuplicateLeaf, { focus: true });
  };
}
