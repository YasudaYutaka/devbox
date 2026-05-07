# DevBox

Local-first developer utilities built with Next.js.

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## GitHub Pages

This project is configured to deploy as a static export to GitHub Pages at:

[https://YasudaYutaka.github.io/devbox/](https://YasudaYutaka.github.io/devbox/)

In the GitHub repository settings, set **Pages** source to **GitHub Actions**.

The deployment workflow in `.github/workflows/pages.yml` runs on pushes to `main` and can also be started manually. It builds with `NEXT_PUBLIC_BASE_PATH=/devbox`, uploads the `out/` directory, and publishes it through GitHub Pages.

To test the same static export locally:

```bash
NEXT_PUBLIC_BASE_PATH=/devbox npm run build
```
