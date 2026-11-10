# Enhancement technical assessment B

Method: independent Assessment B agent `/root/enhancement_technical_review`; Assessment A and other reviewer reports were not read. This is the detector, implementation audit, and Hallmark check for the enhancement scope, not the parent’s combined critique.

Recorded 2026-11-09. Reviewed `app/routes/_index.tsx`, `app/introduction.css`, `app/components/operations/Schedule.tsx`, the changed operations surface in `Operations.tsx`/`crewcover.css`, and Chat’s context/empty state in `ChatRouteContent.tsx`. The locked `DESIGN.md`, required headline, existing brand, shared shell, and framework architecture govern. No implementation, detector configuration, ignores, or README was changed by this assessment.

## Implementation integrity verdict

Pass with targeted interaction fixes. The implementation expresses CrewCover’s specific workflow: visible vacancies, deterministic eligibility, a staged assignment, and explicit approval before a shared action saves anything. The public preview is prominently marked fictional/read-only, and Chat explains the approval boundary and links to the selected event’s operations views. The markup detector returned no findings. Two interaction issues remain in the source snapshot assessed below; the parent accepted them for a narrow fix batch, whose resulting deployment is outside this report’s verification.

## Audit health score

| Dimension | Score | Evidence and limit |
| --- | ---: | --- |
| Accessibility | 3/4 | Visible skip-link focus and settled Chat Axe pass; programmatic drag-review dialog needs explicit focus return. |
| Performance | 3/4 | Local drag feedback, bounded volunteer tray, no large media or layout animation in this scope. No lab timing, bundle, or physical-device performance measurement was run. |
| Theming | 3/4 | Shared CrewCover tokens and an explicit public dark-theme token block. Existing light/dark public captures have zero Axe violations; this is not complete dark-mode proof for the shared Chat runtime. |
| Responsive design | 3/4 | Sampled production public, schedule, and Chat widths have no document overflow. Full-tile drag activation conflicts with ordinary touch scrolling in the nested crew tray. |
| Implementation integrity | 3/4 | Actions and approval boundaries are coherent; focus and touch details need the targeted changes below. |
| **Total** | **15/20** | **Good — address the interaction weaknesses.** |

Issue count for the assessed snapshot: **P0 0 · P1 0 · P2 2 · P3 1**. The touch finding is verified at the CSS/sensor-contract level; a synthesized touch gesture or physical-device reproduction was not performed. None of the scores is a WCAG certification or release approval.

## Detailed findings

### P2 — Closing a drag review has no explicit focus destination

- **Location:** `app/components/operations/Schedule.tsx:316` / `:322`, the programmatically opened `AlertDialog` and `AlertDialogContent`.
- **Category:** Accessibility.
- **Evidence:** The draft opens from `onDragEnd`, without an `AlertDialogTrigger` or `onCloseAutoFocus`. Installed Radix `react-dialog` modal content prevents its generic unmount fallback and focuses `context.triggerRef.current`; this dialog has no trigger ref. Operations already has an explicit origin/fallback restoration hook, but Schedule does not use it in the assessed snapshot.
- **Impact:** A keyboard user who declines a staged drag can lose the useful focus position and have to find the schedule or crew handle again.
- **Standard:** APG dialog focus-return expectation. This was not reproduced by creating a production vacancy: the QA schedule was fully covered, and this audit did not mutate it.
- **Recommendation:** Reuse the captured-origin focus-return behavior, with a connected fallback such as the active view control when the original handle disappears. Verify Escape and “Keep schedule,” as well as successful approval in the separate workflow test.
- **Suggested command:** `$impeccable harden`.
- **Status:** Parent accepted the fix; final source/deployment confirmation is pending outside this assessment.

### P2 — The whole volunteer tile consumes the touch gesture needed to scroll its tray

- **Location:** `app/components/operations/Schedule.tsx:74` (drag listeners on the entire tile), `:173` (8px PointerSensor activation), `app/crewcover.css:1313` (bounded `overflow-y: auto` crew tray), and `:1331` (`touch-action: none` on each tile). Line references describe the inspected pre-fix snapshot.
- **Category:** Responsive interaction / Accessibility.
- **Evidence:** On mobile the crew list is a single column with a 160px maximum height. All of each volunteer tile is a drag activator and disables native touch panning. A swipe that starts over a tile therefore cannot pan the nested list; movement past 8px begins dragging. Narrow whitespace and the search field are workarounds, and manual vacancy assignment remains available.
- **Impact:** A phone user can unintentionally pick up a volunteer when trying to reach later volunteers in the scrolling list.
- **Standard:** Native touch-panning contract and drag-gesture usability. Firefox emulated viewport captures establish layout only; they do not establish gesture behavior. No physical device or synthesized touch sequence was used here.
- **Recommendation:** Restrict drag listeners and `touch-action: none` to a dedicated, adequately sized grip button; allow `pan-y` over the tile’s text. Preserve the keyboard instructions and non-drag vacancy picker. Verify scrolling from the text area, deliberate dragging from the grip, interruption/cancellation, and keyboard review.
- **Suggested command:** `$impeccable adapt`.
- **Status:** Parent accepted this narrow fix; final gesture verification belongs to the confirming workflow pass.

### P3 — Public links have hover/focus feedback but no pressed treatment

- **Location:** `app/introduction.css:51` / `:65` (`.cc-public-button` and hover), with text-link styling nearby.
- **Category:** Implementation integrity / interaction polish.
- **Evidence:** Hallmark gate 26b reports no `:active` styling. The public controls are native links and global `*:focus-visible` supplies an immediate focus outline; this is not an inoperable-control or WCAG AA finding.
- **Impact:** Pointer/touch activation has less feedback than hover and keyboard focus.
- **Recommendation:** Add a restrained token-based pressed treatment consistent with the released controls; do not change the brand or primary action.
- **Suggested command:** `$impeccable polish`.

## Deterministic detector

Exactly one detector scan was run, on the four markup targets together:

```text
impeccable detect --json app/routes/_index.tsx app/components/operations/Schedule.tsx app/components/operations/Operations.tsx app/components/chat/ChatRouteContent.tsx
```

Exit **0**, **0 primary findings**, JSON `[]`. Raw result: [technical-b-detector.json](../../.impeccable/review/enhancements/technical-b-detector.json).

This was a source markup scan, not a CSS-only scan or a rendered visual certification. The existing project configuration was respected: no ignored rules/files, and a previously recorded `overused-font: inter` value exception matching normative `DESIGN.md` typography. No suppression or configuration was added or changed. There is no `.impeccable/critique/ignore.md` or local detector config.

## Hallmark results and complete triage

The installed tool supports `--scope page|component|app`; it was used at public-page scope for `_index.tsx` plus `introduction.css`, and app scope for the operations/Chat markup plus `crewcover.css`. No theme draw or redesign was performed.

| Sweep | Raw result | Render status |
| --- | --- | --- |
| Public, 2 explicit files | **14 FAIL · 34 REFLEX · 2 WARN** | **Not run: no `puppeteer-core` found locally, globally, or via `HALLMARK_PUPPETEER`.** `--render --url https://crewcover-iota.vercel.app` was actually attempted. No dependency was installed. |
| App, 4 explicit files | **0 FAIL · 0 REFLEX · 2 WARN · 95 NOTE** | Static scope only (`render: off`). |

Raw results: [public JSON](../../.impeccable/review/enhancements/technical-b-hallmark-public.json), [app JSON](../../.impeccable/review/enhancements/technical-b-hallmark-app.json). Raw findings are retained; the dispositions below do not alter them.

| Raw group | Count | Disposition and source evidence |
| --- | ---: | --- |
| FAIL 48, dark color literals | 12 | **Parser limitation, not twelve hard-coded component colors.** The declarations are custom properties in the explicit `@media (prefers-color-scheme: dark) { .cc-intro { … } }` theme block, then consumed through `var(--cc-*)`. Hallmark’s floor expressly allows a declared theme block. At scan time this was `introduction.css:362–373`; the parent’s provenance comment subsequently shifted the block to `:365–376`. Do not replace the palette or suppress the rule. |
| FAIL 19, en dash | 1 | **Domain punctuation.** `_index.tsx:109` contains the actual illustrative shift interval `09:00–13:00 WAT`. It separates time endpoints rather than adding a prose flourish. Keeping the event time range is intentional. |
| FAIL 20, missing stamp | 1 | **Bookkeeping, resolved in current source by the parent.** The scan saw the original descriptive line at `introduction.css:1`. The parent then added explicit Hallmark/locked-system provenance at the top. This assessment did not rerun or rewrite the historical raw result. |
| REFLEX 24b, off-4px spacing | 33 | **Existing system/brief conflict, not functional failure.** `DESIGN.md` explicitly records context-specific compact measurements and says the system is not a strict single-ratio grid. The public extension uses this brand’s existing measurements. No screenshot evidence shows broken alignment requiring a global spacing replacement. No waiver was added. |
| REFLEX 26b, no active state | 1 | **Confirmed small interaction gap.** Tracked as the P3 finding above. Native links are operable and focus-visible works. |
| WARN 58, headline length | 1 | **Required copy governs.** The user expressly requires the existing long headline. Fresh 1280×800 production measurement places the h1 bottom at **494.8px** and the primary action bottom at **676.7px**; both fit. Do not shorten it to satisfy the default seven-word rule. |
| WARN 58, hero paragraph length | 1 | **Density advisory only.** The 20-word recovery explanation and product-specific preview remain readable in sampled captures, with the primary action above the fold. This is not a rendering or task-completion failure. |
| App WARN 25, 85ch tray guidance | 1 | **Low-impact readability advisory.** `crewcover.css:1307` caps short instruction/status prose at 85ch. The mobile layout wraps it normally. A 75ch cap could improve desktop reading, but no release-blocking defect is demonstrated. |
| App WARN F7, repeated container recipe | 1 | **Inherited app structure, not evidence of interchangeable content.** The shared ledger/coverage/repair surfaces deliberately share borders and radii; the navy repair queue, semantic states, table rows, and domain actions have different roles and hierarchy. Preserve the locked system. |
| App NOTE 24b and related bookkeeping | 95 | **Notes remain notes.** App scope plus the existing polish/system provenance reports inherited spacing/structure as non-blocking notes. No new blanket waiver or ignored file was introduced. |

Hallmark’s judged checks supported by the actual captures: the hero and primary action fit at 1280×800; the container stays capped at 1920; preview content is visibly fictional rather than invented customer proof; palette, type, icon family, and domain labels match CrewCover; there is no decorative motion or hidden-at-rest marketing content. The real app exists while the public hero uses a constructed, labeled preview; Hallmark gate 84 prefers genuine app captures. Treat that as a material recommendation for a future public-page pass, not a reason to fabricate a capture or replace the approved read-only preview during this technical fix batch.

## Browser evidence

Fresh production evidence: [technical-b-browser.json](../../.impeccable/review/enhancements/technical-b-browser.json), captured in **headless Firefox** using separate new pages for `/`, `/operations?view=schedule`, and `/chat`. Only navigation, viewport changes, keyboard focus, diagnostic browser injection, and reads were performed. No schedule mutation, chat prompt, repair generation, approval, or cancellation was invoked.

| Surface | Fresh widths | Observed result |
| --- | --- | --- |
| Public | 1280×800, 1920×1080, 390×844 | No document overflow. Hero h1 and primary action fit at 1280×800. First Tab reaches the visible “Skip to content” link with a 2px teal outline. |
| Schedule | 1440×1000, 390×844 | No document overflow. Crew tray and shared schedule surface render. QA schedule showed 100% coverage, so no vacancy was created for a drag-review test. |
| Settled Chat | 1440×1000, 390×844 | Context nav and exact empty-state h1 were awaited; context included Gather 2026 before capture. No document overflow. Fresh mobile Axe scan returned **0 violations**. Four prompt targets measured 38/56/38/56px high; 38px is below the 44px touch comfort target but exceeds the 24px AA size floor. |

Representative captures: [public 1280](../../.impeccable/review/enhancements/technical-b-public-1280.png), [public 1920](../../.impeccable/review/enhancements/technical-b-public-1920.png), [schedule 390](../../.impeccable/review/enhancements/technical-b-schedule-390.png), [settled Chat 1440](../../.impeccable/review/enhancements/technical-b-chat-1440.png), [settled Chat 390](../../.impeccable/review/enhancements/technical-b-chat-390.png).

The existing [accessibility.json](../../.impeccable/review/enhancements/accessibility.json) records 15 local Firefox view checks with zero Axe violations and no reported document overflow where measured: public light/dark at 1440/768/390/360, schedule/repairs/activity at 1440/390, and Chat 390. Its local URL is `http://localhost:8091`; that preview was no longer reachable during this assessment. Earlier Chat captures were known unsettled and were **not used** for this assessment’s Chat conclusion; the new captures above waited for the loaded context and empty state. Automated Axe checks cannot prove all keyboard, assistive-technology, contrast, focus-return, or touch behavior.

### Browser overlay attempt and cleanup

Mutable browser preflight **succeeded**: changing/restoring `document.title` worked, and an appended inline script executed. The local Impeccable helper started successfully on port 8400. Injection of `http://localhost:8400/detect.js` was then attempted through the QA browser on all three representative pages. Each script load **timed out**, no Impeccable overlay element appeared, and no matching Impeccable/CORS/mixed-content console message was emitted. Therefore **no reliable user-visible overlay or browser-detector result is available**. The evidence does not identify a specific CORS policy as the cause; it only establishes failure to load the local helper script from these production pages.

There is no presented `[Human]` browser tab: these are headless Playwright captures. The helper was stopped successfully with **`live-server stop --keep-inject`** (exit 0), avoiding source HTML removal. The browser closed in `finally`. The first sandboxed attempt failed with `NS_ERROR_UNKNOWN_HOST`; the permitted network-enabled rerun supplied the fresh evidence. No service dependency was installed to manufacture a pass.

## Positive implementation patterns

- The public introduction uses native anchors, landmarks, labeled sections, a skip link, native FAQ disclosure, and an unmistakably fictional preview.
- Drag only stages a draft. Eligibility is checked on drop and again through the shared assignment action after explicit approval; pending UI does not rewrite existing assignments.
- Error/status feedback exists in the crew tray; a cancelled drag clears the active volunteer and explains that the schedule did not change. The non-drag vacancy flow remains available.
- Chat retains the shared framework composer/runtime and adds bounded CrewCover context and useful prompts, rather than a second independent agent client.
- Tokens, semantic status words, responsive layouts, and scoped reduced-motion rules preserve the released call-sheet design.

## Recommended next steps

1. **P2 — `$impeccable harden`:** share focus return with the drag-review modal; confirm cancellation and approval return to a useful control.
2. **P2 — `$impeccable adapt`:** use a dedicated grip and verify tray panning, deliberate drag, interrupted drag, and keyboard review. Keep the non-drag picker.
3. **P3 — `$impeccable polish`:** add public pressed feedback and optionally tighten the short desktop tray guidance measure. Preserve the required headline, Inter, brand tokens, and shared shell.

Final screenshots and release confirmation must follow the parent’s narrow fix/deployment batch. This report does not claim those later changes passed.

Run provenance: target slug `app-routes-index-tsx`; ignore list absent; assessment independent; exactly one markup detector scan; Hallmark static results retained; render dependency absent; mutable browser preflight passed; overlay loading failed; headless screenshots used as fallback; helper/browser cleanup complete. The temporary browser runner was removed after this evidence was produced. Raw JSON/screenshots are retained intentionally. Snapshot/trend synthesis and any user-facing follow-up belong to the parent run.

Questions skipped: delegated technical Assessment B; the parent is completing the authorized fix and verification work.
