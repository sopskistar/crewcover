# CrewCover handover

Production: https://crewcover-iota.vercel.app  
Repository: https://github.com/sopskistar/crewcover

The existing Vercel project and Neon integration are preserved. No replacement project, database or repository was created. Original Git history, remote, license and environment entries remain. The official standalone Agent-Native Chat starter was integrated into the repository root.

## Implemented

- Private event operations, schedule, volunteer directory/editor, Repair Center, activity and embedded agent.
- Twenty fictional volunteers, ten shifts, qualifications, availability restrictions, hour limits, critical roles and safe repeatable reset.
- Deterministic availability, qualification, overlap, cancellation and hour validation; ranked candidates and honest unresolved gaps.
- Pending repair proposals, explicit human approval/rejection, atomic persistence, revision checks, audit history and duplicate/concurrent protection.
- Shared typed Agent-Native actions used by both the interface and real Gemini. A fresh agent tool read recognizes manual changes.
- Neon release migrations, working production authentication, server-only secrets and persisted AI request budgets.
- Original icon/favicon/social assets, responsive ledger, focus return, reduced motion and design-system documentation.

## Verified evidence

Twenty-one unit/database tests pass. TypeScript, Agent-Native doctor and the official Node24/Nitro/Vercel production build pass. Production GET health confirms both application and authentication schemas. The cancellation-to-approval flow and manual assignment have been exercised against Neon.

The real Gemini proof captured coverage and proposal actions at 85% pending coverage, UI approval to 100%, manual replacement, and a new coverage action returning 100% at revision 250. The final deployed workflow passed in one complete run after evidence-script corrections; no mocked inference or fabricated response is counted.

The final production Firefox suite passed all seven cases in 3.2 minutes. Axe found zero violations across all five views and the agent panel. Desktop, tablet and phone captures were reviewed; the three enhancement navigation findings were independently scored resolved. Nineteen audited view/state combinations had zero Axe violations, and the actual success toast measured 5.86:1 contrast. The credential scan found zero matches across Git candidates and public assets. Release source and sanitized verification evidence are delivered on the existing main branch; the exact commit is recorded in Git history.

The corrected canonical Node preview also passed real authentication and rendered the persisted Neon schedule. Use `pnpm build:node` and `NITRO_PORT=8091 pnpm start:local`. Vite hot reload is still unreliable in this WSL session; no further local-only debugging is required for the production release.

## Git delivery

The original implementation commit [`1782149`](https://github.com/sopskistar/crewcover/commit/178214904a3f2451f8d598ce909d1b8da8288148) remains in the preserved history. The final enhancement release is based on the owner’s README and roadmap commits through `2c16bcc`, with narrow updates for verified features and test results. Source, sanitized evidence and documentation are delivered to the existing `main` branch without force-pushing. The exact release SHA and its deployment checks are available in Git history. The recovery tag `crewcover-pre-enhancements-20261109` preserves the prior release. No secret or browser-session files are tracked.

## Practical limits

One private event per organizer; no shared organizer team or volunteer login. Existing assignments are preserved. A real cancellation records unavailability; vacancy-only drag fills do not cancel or transfer existing work. Atomic staffed-shift transfers are outside this release. Profile qualifications are organizer-maintained data. Ranking is reproducible rather than globally optimal.

The owner authorized final hackathon enhancements after the initial release. The established architecture, schema, authentication secrets, Inter typography and existing Vercel/Neon resources are preserved. Decorative motion and atomic shift transfers were omitted to keep the release focused.

Gemini narration can err; validated proposal records and schedule are authoritative. Provider quotas or request budgets can interrupt inference. Repair Center still works without AI. OpenRouter remains a manual alternative and was not certified as automatic fallback.

Upstream non-blocking issues include large framework/editor chunks, conservative h3 icon-rule compilation, the optional capability probe 404 and occasional title-generation 502. The WSL Chromium network failures are documented; Firefox provides independent real browser evidence. Full physical-device/screen-reader certification is not claimed.

## Future roadmap (not shipped)

The next potential product phase is **Resend email invitations and volunteer confirmations**. After an organizer approves a replacement, a future version could email the volunteer a secure accept/decline link, record consent and delivery state, avoid duplicate sends, and reopen a gap if the volunteer declines. This would turn an approved *proposed staffing assignment* into a separately confirmed attendance response; the current MVP does **not** contact volunteers or verify their availability beyond organizer-entered information.

Telegram is intentionally **not** in the first notification phase; only one channel is planned initially. Later options include WhatsApp/SMS alerts and escalation, then volunteer self-service, multi-organizer collaboration, advanced planning, and optional timesheets/payroll for paid teams. These are roadmap items only: **no API keys, notification services, databases, background jobs, or integrations have been implemented for them**. See the README's Future roadmap for detail.

## Recording and submission

The exact timed 2–3 minute script and reset instructions are in [JUDGE_WALKTHROUGH.md](JUDGE_WALKTHROUGH.md). Before recording, sign in, reset your fictional event, and check that Gemini is available within the request budget. Record the actual app with Clips: full coverage, three cancellations, actual tool activity, inspect the pending repair, approve, refresh/history, make a manual change, and ask for a fresh coverage read.

- [ ] Record the public Clips demonstration; no Remotion video is needed.
- [ ] Open its share link in a private window without logging in; verify video and audio.
- [ ] Add the verified Clips URL to README and the submission form.
- [ ] Submit the app URL, repository and public recording through the organizer's current form before the supplied deadline: November 10, 2026, 08:59 WAT (November 9, 23:59 Pacific).

The owner supplies the Clips recording and official submission-form URL. Neither is invented here.

## Final enhancement scope

- Public `/` explains staffing recovery, shows a labeled fictional preview, links into framework authentication, and answers qualifications, approval, privacy and demo questions. It calls no protected scheduling actions. SEO/social metadata and system-light/dark presentations are included.
- Schedule supports reviewed drag-to-fill vacancies with dnd-kit, a visible preview, eligibility/forbidden-target feedback and existing accessible manual controls. Every confirmed fill calls the same authenticated `assign-volunteer` operation and revalidates on the server. No drag calls cancellation or moves existing assignments.
- Repair Center shows real gap, recommendation, pending, unresolved and recovery counts, exact validation reasons, and access to eligible/excluded candidates.
- Standalone chat identifies CrewCover, preserves event context, offers real example prompts through AgentKit, and links back to operations/schedule/repairs. Suggestions remain distinct from approved changes.
- Production regression identified a stale browser snapshot after a successful profile save. Event Operations now explicitly fetches current event state on mount; direct protected readback confirmed the saved database value.
- Known-good recovery tag: `crewcover-pre-enhancements-20261109` at `35321b5`. The owner's rewritten README commit `2ca107c` was fast-forwarded into main without discarding the ongoing application work.

## Enhancement release validation

Verified prebuilt enhancement deployment: `dpl_BHbNvuXJwnECdDQmLLnZBPhP3ugv`, using the existing project and URL. The subsequent Git-delivered release is recorded below. TypeScript, Doctor, 21 domain/database tests and the official Vercel production build pass. All seven production Firefox cases pass in 3.2 minutes, including lower-row dragging with the agent panel open, invalid drops, explicit confirmation, persistence, focus return, emulated touch taps and responsive tab resizing. Security smoke rejects anonymous actions/chat (401), verifies protected operations/health (200), and confirms Neon application/auth schemas.

The real Gemini proof passed as one complete run at revision 250 after a human-approved manual drag assignment. Coverage was 85% while the repair was pending and 100% after approval; the fresh tool read confirms saved 100% coverage. Sanitized proof, session-isolation results, accessibility and measured feedback contrast are in docs/evidence. Raw credentials, sessions, browser traces and provider data remain ignored and restricted.

Physical-device swipes, complete screen-reader certification and automatic OpenRouter fallback remain unverified. The manual picker is the tested phone alternative. Atomic transfers between already-staffed shifts and elaborate decorative effects were skipped; dragging never represents a cancellation. No Remotion or separate generated video was created.

The release is ready for the owner's genuine public Clips recording. Follow JUDGE_WALKTHROUGH.md, reset only your fictional event, record the real workflow, test the public share link signed out, then add that URL and submit. The recording and submission remain owner actions; no URL or submitted entry is fabricated.

## Git-delivered release and post-push verification

Release source commit [`664f1ac`](https://github.com/sopskistar/crewcover/commit/664f1ac04b335344fc206e3222873cac53c960fe) is pushed to `main`, directly above the preserved roadmap commit `2c16bcc`. The recovery tag is also pushed. GitHub's Vercel check succeeded and the production alias was verified on deployment `dpl_rs9EZHfZ18z1SUPrwCkkGQcAyvPo`.

At 03:36 UTC on November 10, the post-push Firefox/read-only check verified the public introduction (200), phone layout, authenticated workspace, drag controls, and Sofia's saved Guest assistance assignment. A fresh protected action read returned 100% coverage at revision250; Neon and both application/authentication schemas were healthy. No AI request was made. The sanitized receipt is [release-verification.json](evidence/release-verification.json). Later receipt-only documentation commits do not change the tested application.

The owner still records the public Clips demonstration, tests its share link signed out, adds the URL, and submits by **November 10, 2026, 08:59 WAT**. Resend and volunteer response flows remain explicitly future functionality.
