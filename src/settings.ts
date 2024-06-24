import { App, PluginSettingTab, Setting, TFolder } from "obsidian";
import Mononote from "./main";

export class MononoteSettingsTab extends PluginSettingTab {
  plugin: Mononote;

  private delayOptions: number[] = [
    100,
    150,
    200,
    300,
    500,
  ];

  constructor(app: App, plugin: Mononote) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl, plugin } = this;

    containerEl.empty();
    containerEl.createEl("h2", { text: "Mononote Settings" });

    const delayOptionsRecord = this.delayOptions
      .reduce(
        (acc, current) => {
          acc[`${current}`] = `${current}ms`;
          return acc;
        },
        {} as Record<string, string>,
      );

    // Output format
    new Setting(containerEl)
      .setName("Delay before applying tab switching rules")
      .setDesc(`
        Depending on your machine and the size of your vault, Obsidian might need a bit of time before Mononote's tab switching rules can be applied.

        Example: If you load a note N1 in an tab T1, and N1 is already shown in in T2, Mononote should switch to T2. But if you experience Mononote switching to T2, and then immediately back to T1, that means Obsidian needs more time. In that case, try increasing the delay.`)
      .addDropdown((dropdown) => {
        dropdown
          .addOptions(delayOptionsRecord)
          .setValue(`${plugin.settings.delayInMs}`)
          .onChange(
            async (value) => {
              plugin.settings.delayInMs = +value;
              await plugin.saveSettings();
              this.display();
            },
          );
      });

    // Sponsoring
    const afoURL =
      "https://actions.work/actions-for-obsidian?ref=plugin-mononote";
    containerEl.createEl("div", {
      attr: {
        style: `
          border-radius: 0.5rem;
          border: 1px dashed var(--text-muted);
          color: var(--text-muted);
          display: grid;
          font-size: 85%;
          grid-gap: 1rem;
          grid-template-columns: auto 1fr;
          margin-top: 4rem;
          opacity: 0.75;
          padding: 1rem;
        `,
      },
    })
      .innerHTML = `
        <a href="${afoURL}">
          <img
            src="https://actions.work/img/afo-icon.png"
            style="margin: -0.4rem -0.5rem -0.5rem 0; width: 5rem;"
            alt="Actions for Obsidian icon, a cog wheel on a glossy black background">
        </a>
        <span>
          Mononote is brought to you by
          <a href="${afoURL}"><strong>Actions for Obsidian</strong></a>,
          a macOS/iOS app made by the same developer as this plugin. AFO is the
          missing link between Obsidian and macOS&nbsp;/&nbsp;iOS: 50+ Shortcuts
          actions to bring your notes and your automations together.
          <a href="${afoURL}">Take a look!</a>
        </span>
      `;
  }
}
