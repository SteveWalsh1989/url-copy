# Copy Current URL

A minimal Chrome extension that copies the current active tab URL to the clipboard when you click the extension toolbar icon.

## Install locally

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `/Users/stevewalsh/Documents/Projects/url-copy`.
5. Pin **Copy Current URL** from Chrome's extensions menu for the intended one-click toolbar workflow.

Once pinned, one click on the toolbar icon copies the active tab URL immediately. No popup or second click is used.

## Permissions

- `activeTab`: reads the current tab URL only after you click the extension action.
- `offscreen`: creates a hidden extension document so Manifest V3 can access the Clipboard API without opening UI.
- `clipboardWrite`: writes the active tab URL to your clipboard.

The extension does not request host permissions, store URLs, inject page UI, or send network requests. Restricted browser pages may fail if Chrome does not expose the tab URL or blocks clipboard access; the icon shows a temporary failure badge in that case.

## Publish to the Chrome Web Store

1. Test the unpacked extension locally in Chrome.
2. Create or finish a Chrome Web Store developer account in the [Developer Dashboard](https://chrome.google.com/webstore/devconsole/). Google requires a one-time developer registration fee and 2-Step Verification before publishing.
3. From this project root, create an upload ZIP with only the extension runtime files:

   ```sh
   zip -r copy-current-url-1.0.0.zip manifest.json background.js offscreen.html offscreen.js icons
   ```

4. In the Developer Dashboard, choose **Add new item**, upload the ZIP, and complete the Store Listing, Privacy, and Distribution tabs.
5. In the Privacy tab, describe the single purpose clearly: copying the active tab URL to the clipboard after the user clicks the toolbar icon. Declare that the extension does not collect, store, transmit, or sell user data.
6. Choose visibility: **Private** for trusted testers, **Unlisted** for sharing by direct link, or **Public** for a normal searchable listing.
7. Submit for review. If you need to change code after submission, increase `manifest.json`'s `version`, recreate the ZIP, and upload the new package.

Official docs: [Prepare your extension](https://developer.chrome.com/docs/webstore/prepare), [Publish in the Chrome Web Store](https://developer.chrome.com/docs/webstore/publish), [Distribution settings](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution), and [Program Policies](https://developer.chrome.com/docs/webstore/program-policies).
