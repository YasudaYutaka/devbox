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
