import { MarkdownView, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { PLUGIN_INFO } from "./plugin-info";

type RealLifeWorkspaceLeaf = WorkspaceLeaf & {
  activeTime: number;
  history: any;
  pinned: boolean;
  parent: { id: string };
};

export default class Mononote extends Plugin {
  async onload() {
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(
        this.app.workspace.on("active-leaf-change", this.onActiveLeafChange),
      );
      console.log(`Plugin Mononote v${PLUGIN_INFO.pluginVersion} initialized`);
    });
  }

  onunload() {
    console.log(`Plugin Mononote v${PLUGIN_INFO.pluginVersion} unloaded`);
  }

  private onActiveLeafChange = async (
    activeLeaf: RealLifeWorkspaceLeaf | null,
  ) => {
    const { workspace } = this.app;
    const filePath = activeLeaf?.view.getState().file;
    if (!filePath) return;

    const viewType = activeLeaf?.view.getViewType();
    const isActiveLeafPinned = activeLeaf.pinned;

    // Find all leaves of the same type, in the same window, which show the same
    // file as the one in the active leaf, sorted by age. The oldest tab will be
    // the first element.
    // This list includes the active leaf!
    const duplicateLeaves =
      (<RealLifeWorkspaceLeaf[]> workspace.getLeavesOfType(viewType))
        .filter((l) =>
          // Same window
          l.parent.id === activeLeaf.parent.id &&
          // Same file
          l.view?.getState().file === filePath
        )
        // Sort by `activeTime`, oldest first, but push all never-active leaves
        // to the end
        .sort((l1, l2) => {
          if (l1.activeTime === 0) return 1;
          if (l2.activeTime === 0) return -1;
          return l1.activeTime - l2.activeTime;
        });

    let unpinnedDupes = duplicateLeaves.filter((l) => !l.pinned);
    let pinnedDupes = duplicateLeaves.filter((l) => l.pinned);

    // Keep the cursor position and scroll position of the active leaf for later
    // reuse.
    const ephemeralState = activeLeaf.getEphemeralState();
    const { cursor } = ephemeralState;
    const shouldSetEphemeralState = cursor.from.line !== 0 ||
      cursor.from.ch !== 0 ||
      cursor.to.line !== 0 ||
      cursor.to.ch !== 0;

    // Case 1.a: There are pinned leaves, one of them is the active leaf
    // -> Close all unpinned duplicate leaves
    if (pinnedDupes.length) {
      if (isActiveLeafPinned) {
        unpinnedDupes.forEach((l) => l.detach());
        return;
      }

      // Case 2: There are pinned leaves, neither of them is the active one
      // -> We'll just focus the oldest pinned dupe. This will make Obsidian
      // trigger the `active-leaf-change` event again, the handler will fire
      // once more, cleaning up.
      const newActiveLeaf = pinnedDupes[0];
      if (shouldSetEphemeralState) {
        newActiveLeaf.setEphemeralState(ephemeralState);
      }
      workspace.setActiveLeaf(newActiveLeaf, { focus: true });
      return;
    }

    // Case 3: There are no pinned leaves
    // -> We'll close all unpinned leaves except the oldest, and make that one
    // the active leaf.
    const newActiveLeaf = unpinnedDupes.shift()!;
    if (shouldSetEphemeralState) {
      newActiveLeaf.setEphemeralState(ephemeralState);
    }
    unpinnedDupes.forEach((l) => l.detach());
    workspace.setActiveLeaf(newActiveLeaf, { focus: true });
  };
}
