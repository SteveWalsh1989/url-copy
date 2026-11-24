# Copy Current URL

A minimal Chrome extension that copies the current active tab URL to your clipboard with one toolbar click.

[Download Copy Current URL](https://github.com/SteveWalsh1989/url-copy/releases/latest)

## What it does

- Copies the active tab's exact URL as-is.
- Does not open a popup.
- Does not require a second click.
- Does not copy the page title.
- Does not store copied URLs.
- Does not send anything over the network.

## How to use

1. [Install the extension](#download-and-install) in Chrome.
2. Pin **Copy Current URL** to the browser toolbar.
3. Open any normal webpage.
4. Click the extension icon once.
5. Paste the copied URL wherever you need it.

After a successful copy, the extension briefly shows an `OK` badge. If the browser blocks access to the current page or clipboard, it briefly shows an `ERR` badge instead.

## Download and install

Requires Chrome 116 or newer.

1. Download **Copy-Current-URL.zip** from the [latest GitHub release](https://github.com/SteveWalsh1989/url-copy/releases/latest).
2. Unzip it into a folder you can keep. Chrome loads the extension from this folder.
3. Open `chrome://extensions` and turn on **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the extracted folder containing `manifest.json`.
5. Open Chrome's **Extensions** menu and pin **Copy Current URL**.

Updates are manual. Download a newer ZIP, replace the files in the same folder, then click **Reload** on the extension card at `chrome://extensions`.

## Permissions

- `activeTab`: reads the current tab URL only after you click the extension icon.
- `offscreen`: creates a hidden extension document so the clipboard can be updated without opening UI.
- `clipboardWrite`: writes the current tab URL to your clipboard.

The extension does not request host permissions, inject content scripts, add page UI, store data, or make network requests.

## Notes

Restricted browser pages, such as some `chrome://` pages, may not allow the extension to read or copy the page URL. Normal webpages should work as expected.
