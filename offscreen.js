chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!isCopyUrlMessage(message)) {
    return false;
  }

  writeClipboardText(message.url)
    .then(() => {
      sendResponse({ ok: true });
    })
    .catch((error) => {
      sendResponse({ ok: false, error: getErrorMessage(error) });
    });

  return true;
});

function isCopyUrlMessage(message) {
  return (
    message !== null &&
    typeof message === "object" &&
    message.target === "offscreen" &&
    message.type === "copy-url" &&
    typeof message.url === "string"
  );
}

async function writeClipboardText(text) {
  if (text.length === 0) {
    throw new Error("Cannot copy an empty URL.");
  }

  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.append(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  try {
    // The selected-text copy path is more reliable from MV3 offscreen documents.
    if (!document.execCommand("copy")) {
      throw new Error("Chrome rejected the clipboard copy command.");
    }
  } finally {
    textarea.remove();
  }
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
