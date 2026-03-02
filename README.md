# Delete Attached PDFs – Zotero Plugin

A small Zotero plugin that adds a right-click menu entry to delete all PDF attachments from selected library entries – while keeping the Zotero entries themselves intact.

Useful for freeing up storage space or cleaning up PDF attachments without losing your bibliography.

---

## Features

- New **"Delete all PDFs"** option in the right-click context menu
- Only appears when the selected entries actually have PDF attachments
- Shows a confirmation dialog with a preview of the affected files before deleting
- Only removes PDF attachments – Zotero entries, metadata, and other attachments are left untouched

---

## Requirements

- Zotero 7.0 or newer

---

## Installation

1. Download the latest `.xpi` file from the [`dist/`](dist/) folder
2. In Zotero: **Tools → Plugins → Install Plugin From File…**
3. Select the downloaded `.xpi` file
4. Restart Zotero

---

## Usage

1. Select one or more entries in your Zotero library
2. Right-click → **"Delete all PDFs"**
3. Review the confirmation dialog and confirm

---

## Project structure

```
├── src/
│   ├── manifest.json   # Plugin metadata
│   └── bootstrap.js    # All plugin logic
└── dist/
    └── delete-attached-pdfs.xpi   # Ready-to-install plugin
```

---

## Note

This plugin was built entirely through **vibe coding** with AI assistance – including debugging a sneaky typo (`https::` instead of `https://`) in `manifest.json`. The code works, but was not written by hand in any traditional sense.

---

## License

MIT
