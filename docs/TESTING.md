# Executed verification

Verified on November 9, 2026. Results below distinguish real production operations, isolated database tests and environment limitations.

## Passed

| Check                          | Actual result                                                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime                        | Node 24.22.2 with pinned pnpm 10.29.1; official Agent-Native 0.226.0                                                                          |
| TypeScript                     | `corepack pnpm typecheck` passed                                                                                                              |
| Framework lint/security guards | `corepack pnpm agent-native:doctor` clean; build gate enabled                                                                                 |
| Scheduling/database tests      | `corepack pnpm test`: **21 passed**, two files                                                                                                |
| Production browser suite       | `corepack pnpm exec playwright test --config playwright.firefox.config.ts`: **7 passed in 3.2 minutes**                                        |
| Real Gemini proof              | Actual coverage/proposal calls, unchanged pending coverage, UI approval, manual assignment, fresh coverage tool result: **100%, revision 250** |
| Accessibility                  | Axe WCAG A/AA checks across five views and agent panel: **0 violations**                                                                      |
| Responsive review              | 1440, 1024, 768, 390 and 360px captures; no document overflow; repair action retained before ledger                                           |
| Keyboard/motion                | Escape returns focus to cancellation trigger; visible Tab focus; reduced-motion check passed                                                  |
| Zoom                           | CSS 200% zoom render has no measured document overflow; this is not physical-device certification                                             |
| Neon migrations                | Official framework/app release migrations applied successfully and repeated idempotently; no production schema push                           |
| Production build               | Official Nitro/Vercel build passed under Node24, daily `0 9 * * *` sweep                                                                      |
| Production database/auth       | GET health confirms application/auth schemas; real signup and password sign-in succeeded                                                      |

The 21 tests cover availability, qualification matching, half-open overlap, hour limits, cancellation, deterministic ranking, insufficient candidates, approval/rejection, stale/duplicate/concurrent approval, coverage units and local time, persisted rows, owner isolation and request budgets. They use isolated PGlite PostgreSQL semantics, not mocked scheduling and not production data.

The browser suite uses a private fictional QA organizer against the actual Vercel/Neon deployment. It checks reset, three cancellations to85%, a pending proposal that has not changed coverage, approval to 100%, refresh-backed persistence, audit history, manual replacement, keyboard focus, narrow-screen filtering and volunteer creation/editing across refresh. It records the shared action endpoint names used by the UI.

## Genuine agent execution

`docs/evidence/agent-proof.json` records the final complete live run. Actual Gemini calls read coverage and created a pending proposal at 85%; the organizer approved to 100%, then made a manual assignment change. The new tool read returned 100% at revision 250. `resumedVerification` is false. The final run uses no mocked response or inference.

Earlier segmented investigations fixed hidden-control selection and response-collection bugs; those failed harness attempts are not counted as the final pass.

The normal reproduction command is `node scripts/live-agent-proof.mjs --firefox`. It uses ignored QA credentials and makes actual provider requests. Do not run it against a real organizer's event or commit its raw trace.

## Review and fixes

Initial independent Impeccable critique:29/40; technical audit:14/20. The correction batch fixed narrow-screen repair access, target sizing, redundant eyebrow, phrase wrapping, contrast, semantic tokens and dialog focus. The finish reviewer scored all four prior material design fixes resolved, with disposition **ship at that scope**. All eleven recaptures were inspected. DESIGN.md and its token-bearing sidecar were produced and validated by the shipped documenter.

Hallmark static sweep:0FAIL, one intentional compact-spacing waiver, one reviewed container warning. Its render tier was attempted but unavailable without puppeteer-core. Actual browser screenshots and Axe were run through installed Playwright. The single Impeccable source detector returned `[]`; its browser overlay was blocked by Chromium's loopback/CORS restriction and cleaned up. See QUALITY_REVIEW.md for complete warning dispositions.

## Reproducibility and limits

Browser fixtures live in ignored `.tmp/`; browser traces and reports are ignored. `scripts/production-auth.mjs` prepares a session using the private QA fixture. Local development uses the framework's local-only Continue button. Do not expose these credentials or copy session files into documentation.

Chromium initially passed the two core browser cases, then this WSL host repeatedly cancelled requests with `ERR_NETWORK_CHANGED`, including local assets. Final tests used real Firefox networking. This is not evidence that a full Chrome/Safari/physical-device matrix passed. The optional capability probe404 and intermittent title-generation502 did not prevent the verified staffing flow; provider availability remains a limitation.

A first profile test refreshed before its save completed; the trace showed an aborted request. The test now waits for the dialog to close and resets its own event. The full corrected three-test suite passed. Failed investigations are not counted as passes.

The canonical Node build (`NITRO_PRESET=node`) and `start:local` passed real password sign-in and rendered the persisted Neon conference. The legacy `node_server` spelling skipped Agent-Native's Yjs packaging and was corrected. Local migrations against an ignored PGlite database also passed; Vite hot reload remains unstable in this WSL session. Production verification takes priority over further local-only investigation.

The final public-build secret scan is recorded in FINAL_HANDOVER.md. Lighthouse/Core Web Vitals, password reset delivery, full screen-reader certification, OpenRouter inference and physical-device testing are not claimed.

Final production security smoke: unauthenticated actions and chat both returned 401; authenticated workspace/actions/health returned 200; runtime response credential matches: 0. See `docs/evidence/security.json`.

## Final enhancement verification

Seven production Firefox cases passed in one complete 3.2-minute run against deployment `dpl_BHbNvuXJwnECdDQmLLnZBPhP3ugv`. They cover the original cancellation/proposal/human-approval/persistence/manual flow; responsive directory behavior; saved profile changes through refresh; public read-only introduction with light/dark accessibility and protected operations; invalid drag rejection, valid review, decline, explicit approval, persistence and focus return; keyboard drag cancellation plus real emulated touch taps through the phone manual picker; and selected-event chat context/navigation.

The extra domain/database cases verify that preview eligibility agrees with actual assignment validation, invalid drops make no changes, existing assignments are preserved, and the shared assignment action persists a fill while rejecting anonymous, cross-owner, invalid and duplicate writes. All 21 tests use isolated PostgreSQL semantics.

The production profile regression initially exposed a restored browser cache value of eight hours after a real six-hour save. Both the successful action response and a direct protected action read showed six persisted hours. `staleTime: 0` and `refetchOnMount: "always"` now ensure a fresh event read on entry; the complete suite passes without weakening the assertion.

Separate production organizer isolation is recorded in `docs/evidence/session-isolation.json`: zero events visible to the new organizer, foreign read 404, direct HTTP mutation blocked by the framework approval gate (409). Domain action tests independently reject cross-owner writes. No claim is made that a 409 is itself an owner-check execution.

Initial local phone verification had an interrupted WSL request; its isolated rerun and the complete production run passed. Physical device gestures, swipe panning and full screen-reader certification are not claimed. The crew tile now permits vertical panning and only the dedicated grip activates dragging; Firefox touch taps and keyboard alternatives were actually exercised.

The final phone case also resizes an already-selected Activity tab from phone to desktop and back to 360/390px, checking that the whole active tab remains visible. ResizeObserver handles container changes; modal screenshot capture waits for settled opacity and disables finite animation for evidence. The new drag-review dialog itself disables transitions under reduced motion.

A separate real reset verified the actual rendered success toast at 5.86:1 contrast (minimum 4.5:1), using the existing success tokens. Computed colors and reset result are recorded in `docs/evidence/feedback-contrast.json`; this is not a simulated success notification.

The final seven-case run also covers the later Guest assistance row while the agent panel is open. It asserts the actual highlighted drop target, requires approval, and reloads to verify Sofia Park persisted. Drop hints overlay cells and the tray feedback has stable height, avoiding gesture-time layout shifts. The scripted gesture positions both endpoints before pickup.
