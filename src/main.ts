import { Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { PLUGIN_INFO } from "./plugin-info";

type RealLifeWorkspaceLeaf = WorkspaceLeaf & {
  _mononoteLeafID: string;
  activeTime: number;
  history: {
    back: () => void;
    backHistory: any[];
    pushState: (state: any) => void;
  };
  id: string;
  pinned: boolean;
  parent: { id: string };
};

const leafChangeHandlers: Map<string, Function> = new Map();

export default class Mononote extends Plugin {
  async onload() {
    const { workspace } = this.app;
    workspace.onLayoutReady(() => {
      this.registerEvent(
        workspace.on("active-leaf-change", this.onActiveLeafChange.bind(this)),
      );
      console.log(`Plugin Mononote v${PLUGIN_INFO.pluginVersion} initialized`);
    });
  }

  onunload() {
    console.log(`Plugin Mononote v${PLUGIN_INFO.pluginVersion} unloaded`);
  }

  private processors: Map<string, Promise<void>> = new Map();

  private async onActiveLeafChange(
    activeLeaf: RealLifeWorkspaceLeaf,
  ): Promise<void> {
    if (!activeLeaf._mononoteLeafID) {
      activeLeaf._mononoteLeafID = `${Math.random() * 10e16}`;
    }

    const unchangingLeafID = activeLeaf._mononoteLeafID;

    if (this.processors.has(unchangingLeafID)) {
      console.debug(`Already processing leaf #${unchangingLeafID}`);
      return;
    }

    const processor = this.processActiveLeaf(activeLeaf);
    this.processors.set(unchangingLeafID, processor);

    try {
      await processor;
    } finally {
      console.debug(`[#${unchangingLeafID}] Finished processing`);
      this.processors.delete(unchangingLeafID);
    }
  }

  private async processActiveLeaf(
    activeLeaf: RealLifeWorkspaceLeaf,
  ): Promise<void> {
    const unchangingLeafID = activeLeaf._mononoteLeafID;
    console.debug(`[#${unchangingLeafID}] Processing leaf`);

    const filePath = activeLeaf.view.getState().file;
    if (!filePath) return;

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
            l._mononoteLeafID !== unchangingLeafID &&
            l.view?.getState().file === filePath
          )
          // Sort by `activeTime`, oldest first, but push all never-active leaves
          // to the end
          .sort((l1, l2) => {
            if (l1.activeTime === 0) return 1;
            if (l2.activeTime === 0) return -1;
            return l1.activeTime - l2.activeTime;
          });

      // No duplicates found, nothing to do
      if (duplicateLeaves.length === 0) {
        console.debug(`[#${unchangingLeafID}] No duplicates found`);
        resolve();
        return;
      }

      // Find the target tab that we'll need to focus in a moment
      const firstPinnedDupe = duplicateLeaves.find((l) => l.pinned);
      const firstUnpinnedDupe = duplicateLeaves.find((l) => !l.pinned);
      const targetToFocus =
        (firstPinnedDupe || firstUnpinnedDupe) as RealLifeWorkspaceLeaf;

      // Keep the cursor position and scroll position of the active leaf for
      // later reuse.
      const ephemeralState = { ...activeLeaf.getEphemeralState() };
      const hasEphemeralState = Object.keys(ephemeralState).length > 0;

      // Deferring the operation for a bit to give Obsidian time to update the
      // tab's history. Without this `setTimeout()`, the history would not be
      // updated properly yet, and the check below would likely fail. ¯\_(ツ)_/¯
      setTimeout(() => {
        // If the active leaf has history, go back, then focus the target tab
        if (
          activeLeaf.view.navigation &&
          activeLeaf.history.backHistory.length > 0
        ) {
          console.debug(`[#${unchangingLeafID}] go back`);

          // This will trigger another `active-leaf-change` event, but since this
          // leaf is already being processed, the event will be ignored
          activeLeaf.history.back();
        } else {
          console.debug(`[#${unchangingLeafID}] detach`);

          // The active leaf has no history, so we'll close it after focussing the
          // new target tab
          activeLeaf.detach();
        }

        // Focus the target tab after a short delay. Without the delay, the tab
        // operation would fail silently, i.e. the tab would not be focused.
        setTimeout(() => {
          workspace.setActiveLeaf(targetToFocus, { focus: true });
          if (hasEphemeralState) {
            targetToFocus.setEphemeralState(ephemeralState);
          }
        }, 50);

        // Resolve the promise.
        resolve();
      });
    });
  }
}
