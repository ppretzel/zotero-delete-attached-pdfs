"use strict";

var DeleteAttachedPDFs = {

  _menuShowingListeners: new WeakMap(),

  log(msg) {
    Zotero.debug("[DeleteAttachedPDFs] " + msg);
  },

  addToAllWindows() {
    for (let win of Zotero.getMainWindows()) {
      if (win.ZoteroPane) this.addToWindow(win);
    }
  },

  addToWindow(win) {
    let doc = win.document;

    // Avoid double-adding
    if (doc.getElementById("delete-pdfs-menuitem")) return;

    let menu = doc.getElementById("zotero-itemmenu");
    if (!menu) return;

    // Separator
    let sep = doc.createXULElement("menuseparator");
    sep.id = "delete-pdfs-separator";
    menu.appendChild(sep);

    // Menu item
    let item = doc.createXULElement("menuitem");
    item.id = "delete-pdfs-menuitem";
    item.setAttribute("label", "Delete all attached PDFs");
    menu.appendChild(item);

    // Click handler
    item.addEventListener("command", () => this.deleteSelectedPDFs(win));

    // Show/hide based on selection
    let listener = () => this._onMenuShowing(doc, win);
    this._menuShowingListeners.set(menu, listener);
    menu.addEventListener("popupshowing", listener);

    this.log("Menu item added to window.");
  },

  removeFromAllWindows() {
    for (let win of Zotero.getMainWindows()) {
      if (win.ZoteroPane) this.removeFromWindow(win);
    }
  },

  removeFromWindow(win) {
    let doc = win.document;

    doc.getElementById("delete-pdfs-separator")?.remove();
    doc.getElementById("delete-pdfs-menuitem")?.remove();

    let menu = doc.getElementById("zotero-itemmenu");
    if (menu) {
      let listener = this._menuShowingListeners.get(menu);
      if (listener) {
        menu.removeEventListener("popupshowing", listener);
        this._menuShowingListeners.delete(menu);
      }
    }
  },

  _onMenuShowing(doc, win) {
    let menuitem = doc.getElementById("delete-pdfs-menuitem");
    let separator = doc.getElementById("delete-pdfs-separator");
    if (!menuitem) return;

    let hasPDFs = this._getSelectedPDFAttachments(win).length > 0;
    menuitem.hidden = !hasPDFs;
    separator.hidden = !hasPDFs;
  },

  _getSelectedPDFAttachments(win) {
    let selectedItems = win.ZoteroPane.getSelectedItems();
    let pdfs = [];

    for (let item of selectedItems) {
      if (!item.isRegularItem()) continue;
      for (let id of item.getAttachments()) {
        let att = Zotero.Items.get(id);
        if (att && att.isPDFAttachment()) {
          pdfs.push(att);
        }
      }
    }
    return pdfs;
  },

  async deleteSelectedPDFs(win) {
    let pdfs = this._getSelectedPDFAttachments(win);

    if (pdfs.length === 0) {
      win.alert("No PDF attachments were found in the selected entries.");
      return;
    }

    // Build a short preview list (max 5 entries)
    let preview = pdfs
      .slice(0, 5)
      .map(a => "  • " + (a.getField("title") || a.attachmentFilename || "(unknown)"))
      .join("\n");
    if (pdfs.length > 5) preview += `\n  … and ${pdfs.length - 5} more`;

    let result = Services.prompt.confirmEx(
      win,
      "Delete Attached PDFs",
      `What would you like to do with the following ${pdfs.length} PDF attachment${pdfs.length > 1 ? "s" : ""}?\n` + preview,
      (Services.prompt.BUTTON_POS_0 * Services.prompt.BUTTON_TITLE_IS_STRING) +
      (Services.prompt.BUTTON_POS_1 * Services.prompt.BUTTON_TITLE_IS_STRING) +
      (Services.prompt.BUTTON_POS_2 * Services.prompt.BUTTON_TITLE_IS_STRING),
      "Delete Permanently", "Cancel", "Move to Trash",
      null, {}
    );
    if (result === 1) return;  // Cancel or Escape

    let deleted = 0;
    let errors = 0;

    for (let att of pdfs) {
      try {
        if (result === 0) {
          await att.eraseTx();
        } else {
          att.deleted = true;
          await att.saveTx();
        }
        deleted++;
      } catch (e) {
        this.log("Error deleting attachment " + att.id + ": " + e);
        errors++;
      }
    }

    this.log(`Deleted ${deleted}, errors: ${errors}`);

    if (errors > 0) {
      win.alert(`${deleted} PDF${deleted > 1 ? "s" : ""} processed, but ${errors} error${errors > 1 ? "s" : ""} occurred.\nSee the Zotero debug log for details.`);
    }
  }
};

// ── Zotero 7 Bootstrap Lifecycle ─────────────────────────────────────────────

function install() {}
function uninstall() {}

function startup({ version }) {
  DeleteAttachedPDFs.log("Starting up v" + version);
  Zotero.uiReadyPromise.then(() => {
    DeleteAttachedPDFs.addToAllWindows();
  });
}

function shutdown() {
  DeleteAttachedPDFs.log("Shutting down");
  DeleteAttachedPDFs.removeFromAllWindows();
}

function onMainWindowLoad({ window }) {
  if (window.ZoteroPane) {
    DeleteAttachedPDFs.addToWindow(window);
  }
}

function onMainWindowUnload({ window }) {
  DeleteAttachedPDFs.removeFromWindow(window);
}
