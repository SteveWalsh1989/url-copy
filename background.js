const DEFAULT_TITLE = "Copy current URL";
const OFFSCREEN_DOCUMENT_PATH = "offscreen.html";
const FEEDBACK_TIMEOUT_MS = 1200;

const feedbackTimers = new Map();
let creatingOffscreenDocument;

chrome.action.onClicked.addListener((tab) => {
  void copyActiveTabUrl(tab).catch((error) => {
    console.warn("Copy Current URL: unexpected failure", error);
  });
});

async function copyActiveTabUrl(tab) {
  const tabId = tab?.id;

  try {
    if (typeof tabId !== "number") {
      throw new Error("Chrome did not provide an active tab.");
    }

    const url = getTabUrl(tab);

    await copyTextToClipboard(url);
    await showTemporaryFeedback(tabId, {
      text: "OK",
      color: "#16833A",
      title: "Copied",
    });
  } catch (error) {
    console.warn("Copy Current URL: copy failed", getErrorMessage(error));

    if (typeof tabId === "number") {
      await showTemporaryFeedback(tabId, {
        text: "ERR",
        color: "#B42318",
        title: "Copy failed",
      });
    }
  }
}

function getTabUrl(tab) {
  if (typeof tab?.url !== "string" || tab.url.length === 0) {
    throw new Error("Chrome did not expose a URL for this tab.");
  }

  return tab.url;
}

async function copyTextToClipboard(text) {
  await ensureOffscreenDocument();

  let response;

  try {
    response = await chrome.runtime.sendMessage({
      target: "offscreen",
      type: "copy-url",
      url: text,
    });
  } finally {
    await closeOffscreenDocument();
  }

  if (!response?.ok) {
    throw new Error(response?.error || "Clipboard write failed.");
  }
}

async function ensureOffscreenDocument() {
  if (await hasOffscreenDocument()) {
    return;
  }

  if (!creatingOffscreenDocument) {
    creatingOffscreenDocument = chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ["CLIPBOARD"],
      justification: "Write the active tab URL to the clipboard.",
    });
  }

  try {
    await creatingOffscreenDocument;
  } finally {
    creatingOffscreenDocument = undefined;
  }
}

async function hasOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [offscreenUrl],
  });

  return contexts.length > 0;
}

async function closeOffscreenDocument() {
  try {
    await chrome.offscreen.closeDocument();
  } catch (error) {
    console.debug(
      "Copy Current URL: offscreen cleanup skipped",
      getErrorMessage(error),
    );
  }
}

async function showTemporaryFeedback(tabId, feedback) {
  const existingTimer = feedbackTimers.get(tabId);

  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  await Promise.all([
    chrome.action.setBadgeText({ tabId, text: feedback.text }),
    chrome.action.setBadgeBackgroundColor({ tabId, color: feedback.color }),
    chrome.action.setBadgeTextColor({ tabId, color: "#FFFFFF" }),
    chrome.action.setTitle({ tabId, title: feedback.title }),
  ]);

  const timer = setTimeout(() => {
    feedbackTimers.delete(tabId);
    void resetFeedback(tabId).catch((error) => {
      console.debug(
        "Copy Current URL: feedback reset skipped",
        getErrorMessage(error),
      );
    });
  }, FEEDBACK_TIMEOUT_MS);

  feedbackTimers.set(tabId, timer);
}

async function resetFeedback(tabId) {
  await Promise.all([
    chrome.action.setBadgeText({ tabId, text: "" }),
    chrome.action.setTitle({ tabId, title: DEFAULT_TITLE }),
  ]);
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
