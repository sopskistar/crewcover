## verdict

1. **Preserve explicit event context — resolved.** Reopened `chat-1440.png` and `chat-390.png` show Gather 2026 rather than the fallback label. `ChatOperationsContext` now prefers the accessible event matching the URL's `eventId`, then falls back to the first accessible event; its visible label and three destination links use that selection. The inspected `ChatHomeRedirect` preserves the URL search during handoff. This resolves the original scoped chat-context finding; it is not a multi-event product certification.
2. **Keep mobile context links intact — resolved.** The exact reopened `chat-390.png` shows complete Event Operations, Schedule and Repair Center labels on the navigation row, with the approval notice on a separate row. The link wrapper and no-wrap link labels in source match the visible correction. No regression introduced by this fix is visible in the inspected desktop/mobile chat captures.
3. **Reveal the active workspace tab — resolved.** The replacement `activity-390.png` shows the complete Activity label and its full active underline inside the viewport. The inspected effect reveals the active tab immediately and through a ResizeObserver when the tab container changes size, preserving the existing horizontal tab strip. This answers both the original clipping and the resize case that prevented the first recapture from resolving it.

Evidence gate: the two exact replacement files were reopened. `activity-390.png` is 390 × 1000, modified 2026-11-09 22:25:27 UTC. `drag-review-1440.png` is 1440 × 1000, modified 22:25:53 UTC; the modal is now settled and opaque, with readable volunteer/shift details, eligibility checks, Keep schedule and Approve assignment. Both pass the named recapture-validity check. The reopened chat files retain their prior 22:10:06 UTC modification times, so this verdict does not claim they were recaptured from the parent's latest deployment; their observed fixes agree with the sampled current source.

Regressions introduced by the three-fix batch: none observed in this limited verdict pass. No detector/Assessment B evidence was consulted, no live browser or demo mutation was performed, and only this report was edited. The previously inspected pending-repair/drag supplementary states are not being re-scored or used to broaden this pass.

## remaining

Clear for the three scored findings. This ship verdict covers the scored fixes, not the whole surface. The parent's separate toast-contrast issue and its verification remain outside this verdict. No broad redesign or new issue hunt was performed.

disposition: ship
