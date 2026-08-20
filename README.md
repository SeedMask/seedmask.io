# SeedMask.io

Static marketing site for [seedmask.io](https://seedmask.io) — Astro + TypeScript + CSS.

## Develop

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

Output lands in `dist/`. Preview with `npm run preview`.

## Deploy (Cloudflare Pages)

The site is a static Astro build (`dist/`). Production is **Cloudflare Pages** for `seedmask.io`.

If the GitHub repo is connected to Pages on `main`, a push already triggers the deploy — no manual upload.

Otherwise from this folder:

```sh
npm run build
npx wrangler pages deploy dist --project-name=<your-pages-project>
```

Confirm build settings in the Cloudflare dashboard: framework Astro (or static), build command `npm run build`, output `dist`.

### Coordinator downloads

macOS Apple Silicon `.dmg` and Windows x64 `.exe` are linked from `/app` to the
GitHub Release `v1.0.7` assets.

- Download buttons point at GitHub Release assets (not files hosted in `dist/`).
- When a Linux package exists, enable that card in `src/pages/app.astro`.

### Editing later

- Pages: `src/pages/`
- Blog posts: `src/content/blog/*.md` (frontmatter: `title`, `description`, `pubDate`)
- Brand tokens / layout: `src/styles/global.css`
- Logo / favicon: `public/branding/`, `public/favicon.png`

Push to `main` (or redeploy Pages) after changes.

## Site map

| Route | Purpose |
|---|---|
| `/` | Homepage |
| `/products` | Hardware |
| `/app` | Coordinator |
| `/learn` | Learn hub |
| `/learn/basic-crypto` | Basics |
| `/learn/tutorials` | Tutorials (placeholders) |
| `/learn/blog` | Blog index |
| `/about` | About |
