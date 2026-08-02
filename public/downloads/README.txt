Place SeedMask Coordinator release binaries here so they ship with the static site:

  SeedMask-Coordinator-1.0.0-arm64.dmg   (macOS Apple Silicon)

After `npm run build`, upload `dist/downloads/` to Namecheap `public_html/downloads/`
(or upload the full `dist/` contents including that folder).

Local tip: you can symlink the DMG from
SeedMask_Coordinator/electron/release/ so the site build picks it up without duplicating ~350MB in git.
