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

Eighteen unit/database tests pass. TypeScript, Agent-Native doctor and the official Node24/Nitro/Vercel production build pass. Production GET health confirms both application and authentication schemas. The cancellation-to-approval flow and manual assignment have been exercised against Neon.

The real Gemini proof captured coverage and proposal actions at 85% pending coverage, UI approval to 100%, manual replacement, and a new coverage action returning 100% at revision 94. The final deployed workflow passed in one complete run after evidence-script corrections; no mocked inference or fabricated response is counted.

The final production Firefox suite passed all three cases in 1.0 minute. Axe found zero violations across all five views and the agent panel. All eleven final captures were reviewed; the four prior material design fixes are resolved. The credential scan found zero matches across Git candidates and public assets. Release source and sanitized verification evidence are delivered on the existing main branch; the exact commit is recorded in Git history.

The corrected canonical Node preview also passed real authentication and rendered the persisted Neon schedule. Use `pnpm build:node` and `NITRO_PORT=8091 pnpm start:local`. Vite hot reload is still unreliable in this WSL session; no further local-only debugging is required for the production release.

## Practical limits

One private event per organizer; no shared organizer team or volunteer login. Existing assignments are preserved unless explicitly cancelled. Profile qualifications are organizer-maintained data. Ranking is reproducible rather than globally optimal. No drag-and-drop was added.

Optional scheduling gestures, additional animation, onboarding and visual refinements are explicitly on hold until the owner confirms that the required Clips recording and submission are secured.

Gemini narration can err; validated proposal records and schedule are authoritative. Provider quotas or request budgets can interrupt inference. Repair Center still works without AI. OpenRouter remains a manual alternative and was not certified as automatic fallback.

Upstream non-blocking issues include large framework/editor chunks, conservative h3 icon-rule compilation, the optional capability probe 404 and occasional title-generation 502. The WSL Chromium network failures are documented; Firefox provides independent real browser evidence. Full physical-device/screen-reader certification is not claimed.

## Recording and submission

The exact timed 2–3 minute script and reset instructions are in [JUDGE_WALKTHROUGH.md](JUDGE_WALKTHROUGH.md). Before recording, sign in, reset your fictional event, and check that Gemini is available within the request budget. Record the actual app with Clips: full coverage, three cancellations, actual tool activity, inspect the pending repair, approve, refresh/history, make a manual change, and ask for a fresh coverage read.

- [ ] Record the public Clips demonstration; no Remotion video is needed.
- [ ] Open its share link in a private window without logging in; verify video and audio.
- [ ] Add the verified Clips URL to README and the submission form.
- [ ] Submit the app URL, repository and public recording through the organizer's current form before the supplied deadline: November 9, 2026, 11:59 PM Pacific.

The owner supplies the Clips recording and official submission-form URL. Neither is invented here.
