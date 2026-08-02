---
title: "Air gaps in practice"
description: "How unsigned payloads, device confirmation, and signatures fit together before SeedMask ships."
pubDate: 2026-07-31T12:00:00
cover: "/illustrations/blog-airgap.png"
---

An air gap is a workflow, not a sticker on the box.

In the SeedMask loop you will:

1. **Build** an unsigned Bitcoin or Kaspa transaction in the Coordinator.
2. **Move** that unsigned transaction to the SeedMask device (QR or equivalent offline transfer).
3. **Confirm** amounts and destinations on the device screen.
4. **Return** the signed transaction to the Coordinator and broadcast when you choose.

The device stays the authority. The desktop stays the workspace. Coming soon is the wait for that loop to be available end to end — with open-source scrutiny on the critical path as we ship.
