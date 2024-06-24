import { WorkspaceLeaf } from "obsidian";

export type MononoteSettings = {
  delayInMs: number;
};

export type RealLifeWorkspaceLeaf = WorkspaceLeaf & {
  activeTime: number;
  history: {
    back: () => void;
    backHistory: any[];
  };
  id: string;
  pinned: boolean;
  parent: { id: string };
};
