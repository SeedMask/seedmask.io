Coordinator release binaries are not stored in this git repo (the .dmg is ~330MB).

For local preview only, you can symlink:
  ln -s /path/to/SeedMask-Coordinator-1.0.0-arm64.dmg public/downloads/

For production, host the .dmg on GitHub Releases, Cloudflare R2, or similar,
then point the download URL on /app at that URL.
