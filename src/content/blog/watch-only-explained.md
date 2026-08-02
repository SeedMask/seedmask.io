---
title: "Watch-only means the app never holds your seed"
description: "A short note on what watch-only actually guarantees in the SeedMask Coordinator design."
pubDate: 2026-07-31T12:00:00
cover: "/illustrations/blog-watchonly.png"
---

“Watch-only” is easy to say and easy to fake. In SeedMask’s design it is architectural: the Coordinator is built to work with public wallet state and unsigned transactions, not with your seed phrase sitting in app storage.

That means:

- Balances and history can live on the desktop.
- Transaction construction can happen on the desktop.
- Authorization happens on SeedMask after you confirm on the device.

If a product asks you to type a seed into everyday software “just this once,” it is no longer the cold path you thought you bought. SeedMask’s Coming soon phase is about shipping the honest version of that split — not a soft wallet with a metal shell story.
