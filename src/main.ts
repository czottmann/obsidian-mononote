import { MarkdownView, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { PLUGIN_INFO } from "./plugin-info";

export default class Mononote extends Plugin {
  async onload() {
    this.setup();
  }

  onunload() {
    this.teardown();
  }

  private setup() {
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(
        this.app.workspace.on("file-open", this.fileOpenCallbackFunc),
      );
      console.log(`Plugin Mononote v${PLUGIN_INFO.pluginVersion} initialized`);
    });
  }

  private teardown() {
    console.log(`Plugin Mononote v${PLUGIN_INFO.pluginVersion} unloaded`);
  }

  private fileOpenCallbackFunc = async (file: TFile | null) => {
    const { workspace } = this.app;

    if (!file) {
      return;
    }

    // Get all Markdown leaves which have the same path as the file that was
    // just opened
    let dupeLeaves = workspace.getLeavesOfType("markdown")
      .filter((leaf) => leaf.view.getState().file === file.path);

    // No duplicates, nothing to do
    if (dupeLeaves.length < 2) {
      return;
    }

    // Get reference to active leaf
    const activeView = workspace.getActiveViewOfType(MarkdownView)!;

    // Remove the active leaf from the `dupeLeaves` array
    dupeLeaves = dupeLeaves.filter((leaf) => leaf != activeView?.leaf);

    // Go back to the file that was previously open
    (app as any).commands.executeCommandById("app:go-back");

    // Focus the first duplicate leaf
    window.setTimeout(() => {
      workspace.setActiveLeaf(dupeLeaves[0], { focus: true });
    }, 300);
  };
}
