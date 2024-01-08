# Release history

## 1.1.0, 2024-01-TODO

For Mononote to work correctly, _Settings_ → _Editor_ → **_Always focus new tabs_ MUST BE ENABLED**. This is because it hooks into the `active-leaf-change` event which is not fired for new files when this setting is disabled. Technical limitations, sorry.

### New

- Tab handling has been entirely reworked to be more robust and reliable.
- The plugin now respects window boundaries as it should. Superfluous tabs will only be closed in the active window, other windows will be left alone.
- If Mononote encounters a duplicate, it'll now favor the existing tab, and close the new one. This prevents losing undo history.
- Adds workaround for files which don't trigger Obsidian's `file-open` event, meaning Mononote will now work with files which aren't notes, such as PDFs or images. See the README for information on the updated behavior, and what to expect. [#2]
- Adds support for anchor links: If note A is already open in a tab 1, and you attempt to open note A in a tab 2, but with an anchor link (reference to a headline or block), tab 2 will be closed, while tab 1 will focus the anchor link. [#3]

### Fixes

- If a pinned file is opened again (while active), it will no longer open a duplicate tab [#1]
- Mononote will no longer close pinned tabs. Thanks to @d9k for the PR! [#4]


## 1.0.0, 2023-08-22

- Initial release. Let's get this show on the road! 🚀


## 0.1.0, 2023-06-08

- Initial pre-release
