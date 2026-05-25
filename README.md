# Copy Current URL

A minimal Chrome extension that copies the current active tab URL to your clipboard with one toolbar click.

## What it does

- Copies the active tab's exact URL as-is.
- Does not open a popup.
- Does not require a second click.
- Does not copy the page title.
- Does not store copied URLs.
- Does not send anything over the network.

## How to use

1. Install the extension in a Chromium-based browser.
2. Pin **Copy Current URL** to the browser toolbar.
3. Open any normal webpage.
4. Click the extension icon once.
5. Paste the copied URL wherever you need it.

After a successful copy, the extension briefly shows an `OK` badge. If the browser blocks access to the current page or clipboard, it briefly shows an `ERR` badge instead.

## Local installation

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome or another Chromium-based browser.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the repository folder.
6. Pin **Copy Current URL** from the browser's extensions menu.

The intended workflow is one click after the extension has been pinned to the toolbar. If the extension is not pinned, the browser may require opening the extensions menu first.

## Permissions

- `activeTab`: reads the current tab URL only after you click the extension icon.
- `offscreen`: creates a hidden extension document so the clipboard can be updated without opening UI.
- `clipboardWrite`: writes the current tab URL to your clipboard.

The extension does not request host permissions, inject content scripts, add page UI, store data, or make network requests.

## Notes

Restricted browser pages, such as some `chrome://` pages, may not allow the extension to read or copy the page URL. Normal webpages should work as expected.
