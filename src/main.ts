import { Plugin } from "obsidian";
import { PLUGIN_INFO } from "./plugin-info";
import type { RealLifeWorkspaceLeaf } from "./types";

export default class Mononote extends Plugin {
  private pluginName = `Plugin Mononote v${PLUGIN_INFO.pluginVersion}`;
  private processors: Map<string, Promise<void>> = new Map();

  async onload() {
    const { workspace } = this.app;
    workspace.onLayoutReady(() => {
      this.registerEvent(
        workspace.on("active-leaf-change", this.onActiveLeafChange.bind(this)),
      );

      console.log(`${this.pluginName} initialized`);
    });
  }

  onunload() {
    console.log(`${this.pluginName} unloaded`);
  }

  private async onActiveLeafChange(
    activeLeaf: RealLifeWorkspaceLeaf,
  ): Promise<void> {
    const { id } = activeLeaf;

    if (this.processors.has(id)) {
      this.logMsg(id, "❌ Already processing leaf");
      return;
    }

    const processor = this.processActiveLeaf(activeLeaf);
    this.processors.set(id, processor);

    try {
      await processor;
    } finally {
      this.processors.delete(id);
      this.logMsg(id, "Finished processing");
    }
  }

  private async processActiveLeaf(
    activeLeaf: RealLifeWorkspaceLeaf,
  ): Promise<void> {
    const leafID = activeLeaf.id;
    const logMsg = (label: string, payload: any = "") =>
      this.logMsg(leafID, label, payload);

    logMsg(
      "Processing leaf",
      { file: activeLeaf.view.getState().file, parent: activeLeaf.parent.id },
    );

    const filePath = activeLeaf.view.getState().file;
    if (!filePath) {
      logMsg("Contains no file");
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const { workspace } = this.app;
      const viewType = activeLeaf?.view.getViewType();

      // Find all leaves of the same type, in the same window, which show the same
      // file as the one in the active leaf, sorted by age. The oldest tab will be
      // the first element. This list excludes the active leaf.
      const duplicateLeaves =
        (workspace.getLeavesOfType(viewType) as RealLifeWorkspaceLeaf[])
          // Keep this pane's leaves which show the same file as the active leaf
          .filter((l) =>
            l.parent.id === activeLeaf.parent.id &&
            l.id !== leafID &&
            l.view?.getState().file === filePath
          )
          // Sort by `activeTime`, most recent first, but push all never-active
          // leaves to the end
          .sort((l1, l2) => {
            if (l1.activeTime === 0) return -1;
            if (l2.activeTime === 0) return 1;
            return l2.activeTime - l1.activeTime;
          });

      // No duplicates found, nothing to do
      if (duplicateLeaves.length === 0) {
        logMsg("No duplicates found");
        return resolve();
      }

      // Find the target tab that we'll need to focus in a moment
      const targetToFocus = (
        duplicateLeaves.find((l) => l.pinned) ||
        duplicateLeaves.find((l) => !l.pinned)
      ) as RealLifeWorkspaceLeaf;

      // Deferring the operation for a bit to give Obsidian time to update the
      // tab's history. Without this `setTimeout()`, the history would not be
      // updated properly yet, and the "has history?" check below would fail.
      // ¯\_(ツ)_/¯
      setTimeout(() => {
        // Keep the cursor position and scroll position of the active leaf for
        // later reuse.
        const ephemeralState = { ...activeLeaf.getEphemeralState() };
        const hasEphemeralState = Object.keys(ephemeralState).length > 0;

        // If the active leaf has history, go back, then focus the target tab
        if (
          activeLeaf.view.navigation &&
          activeLeaf.history.backHistory.length > 0
        ) {
          // This will trigger another `active-leaf-change` event, but since this
          // leaf is already being processed, that new event will be ignored
          activeLeaf.history.back();
          logMsg("history.back");
        } //
        // The active leaf has no history but is pinned, so we'll leave it
        // alone and just back off here.
        else if (activeLeaf.pinned) {
          logMsg("pinned tab, not detaching");
          return resolve();
        } //
        // The active leaf has no history, so we'll close it after focussing the
        // new target tab
        else {
          activeLeaf.detach();
          logMsg("detach");
        }

        // Focus the target tab after a short delay. Without the delay, the tab
        // operation would fail silently, i.e. the tab would not be focused.
        setTimeout(() => {
          workspace.setActiveLeaf(targetToFocus, { focus: true });
          if (hasEphemeralState) {
            targetToFocus.setEphemeralState(ephemeralState);
          }
        }, 10);

        // Resolve the promise.
        resolve();
      }, 50);
    });
  }

  private logMsg(leafID: string, label: string, payload: any = "") {
    // console.log(`[${leafID}] ${label}`, payload);
  }
}
