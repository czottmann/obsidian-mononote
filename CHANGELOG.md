# Release history

## 1.2.0, 2024-06-20

I've rewritten the entire internal logic of Mononote (again) to be more robust and reliable. This should fix a lot of the issues that have been reported with endless flickering and tabs being closed prematurely, and make the plugin more stable overall. It's been a journey. 😅

### New

Tabs will only be closed if they have no history.

### Fixes

- If a tab (T1) loads a note (N1), and N1 is already shown in another tab (T2)  [#18]:
    - If T1 has a history, it will go back to its previous file, then T2 will be focussed.
    - If T1 doesn't have history but is pinned, it'll remain open, still showing N1.
    - If T1 doesn't have history and is unpinned, it will close, then T2 will be focussed.
- Clicking on a file in the File Explorer no longer endlessly flashes the tab [#19]
- Cmd/Ctrl-clicking a note in the File Explorer no longer endlessly flashes the tab [#21]
- Clicking on a headline/link in the Outline panel no longer endlessly flashes the linked headline [#26]
- Clicking a link in a pinned tab no longer loads the note in that pinned tab, as you would expect.


## 1.1.1, 2024-01-09

For Mononote to work correctly, _Settings_ → _Editor_ → **_Always focus new tabs_ MUST BE ENABLED**. This is because it hooks into the `active-leaf-change` event which is not fired for new files when this setting is disabled. Technical limitations, sorry.

### New

- Tab handling has been entirely reworked to be more robust and reliable.
- The plugin now respects pane & window boundaries as it should, superfluous tabs will only be closed in the active pane or window. 
- If Mononote encounters a duplicate, it'll now favor the existing tab, and close the new one. This prevents losing undo history.
- Adds workaround for files which don't trigger Obsidian's `file-open` event, meaning Mononote will now work with files which aren't notes, such as PDFs or images. See the README for information on the updated behavior, and what to expect. [#2]
- Adds support for anchor links: If note A is already open in a tab 1, and you attempt to open note A in a tab 2, but with an anchor link (reference to a headline or block), tab 2 will be closed, while tab 1 will focus the anchor link. [#3]

### Fixes

- Mononote no longer gets confused when previewing a link while the Hover Edit plugin is active. [#7]
- If a pinned file is opened again (while active), it will no longer open a duplicate tab. [#1]
- Mononote will no longer close pinned tabs. Thanks to @d9k for the PR! [#4]


## 1.0.0, 2023-08-22

- Initial release. Let's get this show on the road! 🚀


## 0.1.0, 2023-06-08

- Initial pre-release
