# DevBox

DevBox is a local-first collection of developer utilities built with Next.js. It is designed for quick, private day-to-day tasks like generating IDs, formatting payloads, comparing text, and checking text metrics without sending data to a remote service.

## Current Features

- **Dashboard**: browse all available tools from a single home screen and reopen recently used tools.
- **Tool navigation**: use the sidebar, header search, and direct routes to move between tools quickly.
- **Localization**: switch the interface between English and Portuguese.
- **Theme support**: switch between light and dark mode, with the preference stored locally in the browser.
- **UUID Tools**:
  - Generate a single UUID v4.
  - Validate pasted UUID v4 values.
  - Add or remove hyphens.
  - Convert UUID text to uppercase or lowercase.
  - Generate batches of up to 10,000 UUIDs, with confirmation for large batches.
  - Copy individual UUIDs, copy a whole batch, or download a batch as CSV.
- **JSON Formatter & Validator**:
  - Format JSON with indentation.
  - Minify JSON.
  - Validate JSON and show parser errors.
  - Warn on large inputs and block inputs above the hard processing limit.
  - Copy formatted or minified output.
- **JSON Escape / Unescape**:
  - Escape raw text for use inside JSON string values.
  - Unescape JSON-encoded strings back to plain text.
  - Swap input and output in one click.
  - Copy output or clear both panels.
- **HTML Preview**:
  - Edit full HTML documents or snippets in a source editor.
  - Render the current markup into an isolated preview pane.
  - Copy the HTML source or clear the editor.
  - Show when the preview is out of date after source changes.
- **Text Diff**:
  - Compare two text inputs.
  - View differences inline or side by side.
  - Ignore whitespace or case during comparison.
  - Show only changed segments.
  - Swap original and modified text.
  - Warn on large diffs and block inputs above the hard processing limit.
  - Copy a plain-text representation of the diff.
- **Text Extractor**:
  - Drop, paste, or attach image files for OCR.
  - Accept PNG, JPEG, WebP, GIF, BMP, and other browser-supported image uploads under 12 MB.
  - Preprocess images before OCR with resizing, grayscale conversion, contrast adjustment, denoising, and binarization.
  - Run OCR with Portuguese and English language support.
  - Optimize extraction for free text, numbers, UUIDs, currency, dates, email addresses, and code/ID strings.
  - Show image quality, OCR progress, confidence, word counts, and validation hints.
  - Copy extracted text.
- **Character / Word Counter**:
  - Count characters, words, and lines as you type.
  - Clear the text input in one click.
- **Snippets**:
  - Save and organize text snippets locally in the browser (SQL, JSON, regex, shell commands, notes, or any plain text).
  - Two-panel layout: snippet list with search and tag filtering on the left, editor on the right.
  - Create, edit, and delete snippets with an explicit save action and delete confirmation.
  - Tag snippets for quick filtering; tags are derived automatically from saved entries.
  - Copy snippet body to clipboard in one click.
  - Export all snippets to a JSON file and import from a previously exported file (merge, no data loss).
  - All data is stored in `localStorage` under the key `devbox-snippets`; nothing is sent to a server.
- **TODO Board**:
  - Track tasks on a kanban board with To Do, In Progress, and Done columns.
  - Drag and drop cards between columns to change status.
  - Create, edit, and delete tasks with priority, due date, tags, notes, and subtasks.
  - Search tasks by title, notes, or tags, and filter by tag.
  - Export all tasks to a JSON file and import from a previously exported file (merge, no data loss).
  - All data is stored in `localStorage` under the key `devbox-todos`; nothing is sent to a server.

## Tech Stack

- Next.js 16 with static export enabled.
- React 19 and TypeScript.
- Tailwind CSS 4.
- Lucide React icons.
- `diff` for text comparison.

## Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Useful scripts:

```bash
npm run lint
npm run build
```

## GitHub Pages

This project is configured to deploy as a static export to GitHub Pages at:

[https://YasudaYutaka.github.io/devbox/](https://YasudaYutaka.github.io/devbox/)

In the GitHub repository settings, set **Pages** source to **GitHub Actions**.

The deployment workflow in `.github/workflows/pages.yml` runs on pushes to `main` and can also be started manually. It builds with `NEXT_PUBLIC_BASE_PATH=/devbox`, uploads the `out/` directory, and publishes it through GitHub Pages.

To test the same static export locally:

```bash
NEXT_PUBLIC_BASE_PATH=/devbox npm run build
```
