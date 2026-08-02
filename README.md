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

## Deploy to Namecheap

1. Run `npm run build` locally.
2. Open Namecheap hosting (cPanel **File Manager** or FTP).
3. Upload **the contents** of `dist/` into `public_html` (not the `dist` folder itself). Replace the old template files.
4. Confirm HTTPS is already active on `seedmask.io`.
5. Visit the domain and click through Products / App / Learn / About.

### Coordinator downloads

macOS Apple Silicon `.dmg` is linked from `/app` as `/downloads/SeedMask-Coordinator-1.0.0-arm64.dmg`.

- Keep the binary in `public/downloads/` (symlink from `SeedMask_Coordinator/electron/release/` is fine locally).
- Make sure `dist/downloads/` is uploaded to the host — large files may need FTP rather than browser upload.
- When Windows/Linux packages exist, drop them in the same folder and enable the cards in `src/pages/app.astro`.

### Editing later

- Pages: `src/pages/`
- Blog posts: `src/content/blog/*.md` (frontmatter: `title`, `description`, `pubDate`)
- Brand tokens / layout: `src/styles/global.css`
- Logo / favicon: `public/branding/`, `public/favicon.png`

Rebuild and re-upload `dist/` after changes.

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
