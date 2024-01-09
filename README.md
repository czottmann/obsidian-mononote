# Mononote

This plugin ensures each note occupies only one tab **per window pane**. If a note is already open, its existing tab will be focussed instead of opening the same file in the current tab. Works for opening notes via links, menus, hotkeys.

For Mononote to work correctly, _Settings_ → _Editor_ → **_Always focus new tabs_ MUST BE ENABLED**. This is because it hooks into the `active-leaf-change` event which is not fired for new files when this setting is disabled. Technical limitations, sorry.


## Bug Reports & Discussions

For bug reports please use this repo's Issues section — thank you!

I've moved all plugin **discussions** to the ActionsDotWork Forum which is a hub for both my Obsidian plugins and the macOS/iOS productivity apps I'm building: [Carlo's Obsidian Plugins - ActionsDotWork Forum](https://forum.actions.work/c/obsidian-plugins/8).

The forum supports single-sign-on via GitHub, Apple and Google, meaning you can log in with your GitHub account.


## Installation

1. Search for "Mononote" in Obsidian's community plugins browser. ([This link should bring it up.](https://obsidian.md/plugins?id=zottmann))
2. Install it.
3. Enable the plugin in your Obsidian settings under "Community plugins".

That's it.


## Installation via <abbr title="Beta Reviewers Auto-update Tester">BRAT</abbr> (for pre-releases or betas)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat).
2. Add "Mononote" to BRAT:
    1. Open "Obsidian42 - BRAT" via Settings → Community Plugins
    2. Click "Add Beta plugin"
    3. Use the repository address `czottmann/obsidian-mononote`
3. Enable "Mononote" under Settings → Options → Community Plugins


## Development

Clone the repository, run `pnpm install` OR `npm install` to install the dependencies.  Afterwards, run `pnpm dev` OR `npm run dev` to compile and have it watch for file changes.


## Author

Carlo Zottmann, <carlo@zottmann.co>, https://zottmann.co/, https://github.com/czottmann

Make sure to check out my app, [Actions for Obsidian](https://actions.work/actions-for-obsidian?ref=github): The missing link between Obsidian and macOS / iOS: 40+ Shortcuts actions to bring your notes and your automations together. It makes Obsidian a first-class citizen in Apple's Shortcuts app.


## Disclaimer

Use at your own risk.  Things might go sideways, hard.  I'm not responsible for any data loss or damage.  You have been warned.

Always back up your data.  Seriously.


## License

MIT, see [LICENSE.md](LICENSE.md).
