---
name: CrewCover
description: A restrained operations workspace for human-approved event staffing repairs.
colors:
  ink: '#172b36'
  ink-soft: '#314b57'
  paper: '#f5f7f6'
  white: '#ffffff'
  text: '#20333b'
  muted: '#5b6c72'
  nav-text: '#c0d1d3'
  line: '#dce4e0'
  green: '#17684f'
  green-hover: '#0f533e'
  green-soft: '#e5f3eb'
  mint: '#a4e7ce'
  red: '#a53d37'
  red-soft: '#fff0ed'
  red-line: '#dca39c'
  amber: '#855b14'
  amber-soft: '#fff4d9'
  focus: '#16846d'
  table-head: '#edf2ef'
  table-text: '#52665b'
  role-surface: '#fbfcfb'
  queue-text: '#bfd0d4'
  queue-line: '#354d58'
  queue-link: '#d6e4e6'
  avatar: '#edf1ec'
  avatar-text: '#42624f'
  toolkit-primary: hsl(0 0% 15%)
  toolkit-foreground: hsl(0 0% 10%)
  toolkit-border: hsl(0 0% 90%)
  toolkit-ring: hsl(0 0% 40%)
  toolkit-accent: hsl(0 0% 95%)
typography:
  display:
    fontFamily: '"Inter Variable", Inter, system-ui, sans-serif'
    fontSize: 44px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.04em
  headline:
    fontFamily: '"Inter Variable", Inter, system-ui, sans-serif'
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.03em
  queue-title:
    fontFamily: '"Inter Variable", Inter, system-ui, sans-serif'
    fontSize: 21px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.02em
  title:
    fontFamily: '"Inter Variable", Inter, system-ui, sans-serif'
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.015em
  body:
    fontFamily: '"Inter Variable", Inter, system-ui, sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  detail:
    fontFamily: '"Inter Variable", Inter, system-ui, sans-serif'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: '"Inter Variable", Inter, system-ui, sans-serif'
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.5
rounded:
  surface: 12px
  inset: 8px
  control: 6px
  status: 5px
  utility: 4px
spacing:
  inline: 8px
  control: 12px
  inset: 16px
  section: 20px
  panel: 24px
  workspace: 32px
components:
  button-primary:
    backgroundColor: '{colors.green}'
    textColor: '{colors.white}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: 8px 12px
    height: 36px
  button-primary-hover:
    backgroundColor: '{colors.green-hover}'
  button-agent:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.white}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: 8px 12px
    height: 36px
  button-agent-hover:
    backgroundColor: '{colors.ink-soft}'
  button-default:
    backgroundColor: '{colors.toolkit-primary}'
    textColor: '{colors.white}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: 8px 12px
    height: 36px
  button-outline:
    backgroundColor: '{colors.white}'
    textColor: '{colors.text}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: 8px 16px
    height: 36px
  button-queue:
    backgroundColor: '{colors.mint}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: 8px 12px
    width: 100%
  input-search:
    backgroundColor: '{colors.white}'
    textColor: '{colors.text}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: 4px 12px 4px 36px
    height: 36px
  navigation-tab:
    textColor: '{colors.muted}'
    typography: '{typography.label}'
    padding: 0 0 13px
  navigation-tab-active:
    textColor: '{colors.green}'
  chip-pending:
    backgroundColor: '{colors.amber-soft}'
    textColor: '{colors.amber}'
    rounded: '{rounded.status}'
    padding: 3px 7px
  card-recommendation:
    backgroundColor: '{colors.white}'
    textColor: '{colors.text}'
    rounded: '{rounded.surface}'
    padding: 20px
  vacancy-action:
    textColor: '{colors.red}'
    rounded: '{rounded.utility}'
    padding: 0 3px
---

# Design System: CrewCover

## Overview

**Creative North Star: "The Operations Call Sheet"**

The operations call sheet pairs navy working chrome with light, readable records. Compact Inter typography and aligned staffing rows keep people, roles, times, and next actions legible in a busy event venue.

Teal communicates healthy coverage and forward actions, amber identifies proposals awaiting approval, and coral identifies gaps. Motion acknowledges a state change; it does not delay reading the resulting schedule. The existing shared navigation and agent surfaces remain part of the system.

**Key Characteristics:**

- Navy structure and light working surfaces.
- Compact, aligned records with readable headings and tabular numerals.
- Status colors accompanied by labels, counts, or icons.
- Flat containers, restrained borders, and purposeful feedback.

This records the shipped Operate world. The token layer comes from `app/crewcover.css`, the shared light-theme tokens in `app/global.css`, and the resolved Toolkit primitives; it does not replace the shared shell or the framework's separate chat theming. `app/root.tsx` loads the global stylesheet before CrewCover's overrides. `.impeccable/design.json` records exact provenance, source dependencies, responsive mappings, and renderable component snippets.

## Colors

The palette uses deep navy structure, quiet green-tinted neutrals, and explicit operational status colors. Frontmatter is the normative value layer; the names below describe its use.

### Primary

- **Coverage Teal** (`green`, `green-hover`, `green-soft`): healthy coverage, affirmative controls, selected view tabs, and eligibility checks. The soft tone supports activity markers and profile initials.
- **Coordination Navy** (`ink`, `ink-soft`): the shared left navigation, agent entry control, repair queue, headings, and coverage totals. The softer navy is a hover state and mark color.
- **Signal Mint** (`mint`): positive feedback and the repair action on a navy container; also the selection highlight and the original coordination mark's stroke.

### Secondary

- **Proposal Amber** (`amber`, `amber-soft`): pending proposal chips, unresolved-repair notices, and pending activity markers. It signals review, not a completed assignment.

### Tertiary

- **Vacancy Coral** (`red`, `red-soft`, `red-line`): uncovered labels, cancellation activity, empty coverage segments, and gap-tinted ledger cells. The line color outlines an empty position without requiring a solid red fill.

### Neutral

- **Working Paper and White** (`paper`, `white`): workspace canvas and record surfaces.
- **Reading Ink and Muted Text** (`text`, `muted`): normal content and secondary details.
- **Quiet Structure** (`line`, `table-head`, `table-text`, `role-surface`): container boundaries, grid separators, table headings, and role cells.
- **Navy-Surface Text** (`nav-text`, `queue-text`, `queue-line`, `queue-link`): readable secondary content and separators on the dark shell and queue.
- **Profile Tones** (`avatar`, `avatar-text`): compact synthetic-profile initials.
- **Inherited Toolkit Neutrals** (`toolkit-primary`, `toolkit-foreground`, `toolkit-border`, `toolkit-ring`, `toolkit-accent`): unmodified default/outline controls and shared field infrastructure. These preserve the source HSL format instead of introducing a second canonical value.
- **Keyboard Teal** (`focus`): the global visible-focus outline. Toolkit controls also retain their inherited ring treatment.

**The Status Has Words Rule.** Coverage and proposal state must remain understandable through visible text, counts, or icons alongside color.

The sidecar's eight-step color ramps are generated preview aids, not additional shipped palette tokens.

## Typography

**Display Font:** Inter Variable, with Inter and system sans-serif fallbacks.
**Body Font:** The same family; no separate decorative display face or monospace label family is used.

**Character:** Compact and factual. Semibold headings, balanced wrapping, tight tracking on larger text, and tabular numerals make staffing values easy to compare. The global font enables `cv02`, `cv03`, `cv04`, and `cv11`.

### Hierarchy

- **Display** (`display`): coverage percentage only. Its percent suffix is smaller, and the total reduces on narrow containers.
- **Headline** (`headline`): event title. It reduces from its desktop token to (24px) at the narrow container breakpoint.
- **Queue title** (`queue-title`): repair queue heading. Proposal headings use the same size and tracking with the workspace heading line-height (1.25).
- **Title** (`title`): section headings. The viewport mobile rule reduces them to (16px).
- **Body** (`body`): workspace baseline and inherited control font. Actionable content remains concise; explanatory repair text uses observed limits of (60ch) and FAQ text (75ch).
- **Detail** (`detail`): event metadata, guidance, table headings, and repair reasons. Queue prose uses a more open line-height (1.75).
- **Label** (`label`): view tabs. Small pending chips use (11px), medium weight, and sentence case; these are compact status labels rather than a general body role.

The shipped ledger includes (11px) names and detail, (10px) utility metadata, and (8–9px) compact avatar initials. These density exceptions are recorded as implementation facts, not promoted into general content roles.

## Layout

The workspace is a compact operations canvas with an inline-size container. Desktop padding is (30px 32px 18px); the mobile viewport rule uses (20px 16px 16px). The shell's expanded left navigation is (14rem). Reused spacing steps are in the frontmatter; the build also uses context-specific measurements, so this is not a strict single-ratio grid.

The overview pairs a flexible ledger with a fixed (270px) side column and a (25px) gap. The staffing grid reserves `minmax(135px, 0.85fr)` for roles and `repeat(2, minmax(155px, 1fr))` for the implemented two time slots. Recommendation cards flow with `repeat(auto-fit, minmax(min(100%, 285px), 1fr))` and a (16px) gap. The volunteer directory scrolls within its bordered table container. Search is capped at (300px) before the narrow container rule expands it.

Responsive behavior has separate container and viewport inputs:

- **Container at or below (1000px):** the main grid becomes one column, the side stack becomes two columns, coverage actions move to a full-width row with a (44px) minimum height, and proposal summaries stack vertically.
- **Container at or below (650px):** the side stack becomes one column, coverage padding and numeral size reduce, filters wrap, the title and demo label can wrap, and vacancy/cancellation targets reach a (44px) minimum. Repair-start actions become full width.
- **Viewport at or below (767px):** the ledger's desktop heading row hides. Each role becomes a full-width row above two shift cells, and each cell gains its own time label. Profile names may wrap. Header actions and cancellation controls have (44px) minimum targets; paired form fields stack.
- **Shared control breakpoint (768px and above):** Toolkit fields nominally switch from base to small text, but workspace `font: inherit` keeps operations inputs at the body role. The shared chat header's separate (47.99rem) rule belongs to the existing shell.

View tabs remain horizontally scrollable. Dense records do not depend on hover expansion to expose staffing information.

## Elevation & Depth

The operations world is flat by default: white and subtly tinted surfaces sit on paper, separated by thin borders. Navy establishes the shell and repair queue through tone. Record containers have no custom shadow. Shared outline buttons and portaled dialogs retain Toolkit elevation; these are functional control and overlay layers.

### Shadow Vocabulary

- **Outline control:** Toolkit `shadow-xs`, resolved from the installed Tailwind theme; the exact declaration is in the sidecar.
- **Dialog:** Toolkit `shadow-lg`, likewise resolved and recorded in the sidecar. It belongs to the overlay, not ordinary records.

**The Flat Working Surface Rule.** Working records use tonal surfaces and thin borders; inherited control and dialog shadows do not turn every container into a floating card.

## Shapes

Soft rectangular containers use the `surface` radius; inset guidance, fieldsets, and notices use `inset`. Shared controls use the resolved `control` radius from the framework's radius mapping. Compact status chips use `status`, and tiny row actions and skill tags use `utility`. These are related, restrained corners rather than pill-shaped navigation.

Ledger and table containers clip at their rounded boundary. A single thin line separates rows and cells. Avatars, activity markers, and status dots remain circular. The original coordination mark uses a rounded square with a coverage arc and check; reuse `CrewCoverMark` rather than a replacement symbol.

## Components

### Buttons

Compact and direct, with one visible next action.

- **Primary:** coverage teal on white text, resolved shared control corners, default height (36px). Default shared padding is (8px 16px), becoming (8px 12px) when a direct SVG icon is present; the frontmatter examples describe the icon-bearing operations actions.
- **Agent:** navy with white text; hover uses soft navy.
- **Default / Outline:** preserve Toolkit charcoal or white/outlined treatments where the build uses them. Do not silently recolor every imported control.
- **Queue action:** mint on navy-ink text, full width, minimum height (38px), compact label (11px), and wrapping text. Its unlayered mint background takes precedence over Toolkit hover utilities; no separate mint hover tone is implemented.
- **Hover / Focus:** shared buttons transition color, background, border, shadow, transform, and scale over (150ms). The workspace adds a one-pixel pressed displacement. Global keyboard focus uses a (2px) teal outline offset by (3px); shared buttons also carry a (2px) ring with (2px) offset. Disabled workspace controls reduce opacity to (0.55).

### Chips

Small, factual status annotations. Pending chips use proposal amber and a soft amber background with compact padding. They remain plain labels, not interactive filters. Skill tags use a quiet table-toned background and smaller utility text. Repair counts in tabs use coral text on a soft coral tile.

### Cards / Containers

Record surfaces use white, thin quiet borders, and the surface radius. Recommendation cards use section padding; coverage uses (24px 26px); proposal summaries use (25px); the navy repair queue uses (22px). Use the existing container appropriate to the record rather than imposing one universal card size. Ordinary record containers do not gain hover lift.

### Inputs / Fields

Shared fields are (36px) high, softly rounded, white-backed, and thinly outlined. Operations inherits the body font; search adds a left SVG and (36px) left padding. The native qualification select is distinct: (7px) corners, (36px) minimum height, and its own text/arrow padding. Keep visible labels or accessible names. The shared input renders invalid state with the destructive border and disabled state with a blocked cursor and reduced opacity. Shared focus rings coexist with the global visible outline.

### Navigation

Navy shared shell navigation remains intact. Operations view tabs use medium-weight sentence-case labels, muted defaults, navy hover text, and a teal active underline. The active view exposes `aria-current="page"`. Tabs have a (46px) minimum height and scroll horizontally when necessary; the gap reduces from (24px) to (20px) in the narrow container.

### Staffing Ledger and Coverage

The role-by-time ledger is the signature record. Vacancies tint the relevant shift cell and provide a labeled add action; assigned names remain visible beside initials and a named cancellation control. The segmented coverage meter changes the relevant position from a teal block to a coral-outlined empty block, with totals and explicit status alongside it. Pending recommendations remain in the repair view until approved.

Gap arrival uses a short fade and (3px) upward offset settling into place over (260ms). Segment and shift backgrounds transition over the CrewCover duration token. Reduced motion disables transitions and animation within the workspace while keeping the resulting status immediately visible; the immediate one-pixel button press is still implemented. Portaled dialogs live outside this selector and retain shared Toolkit behavior. Dialogs return focus to their origin when it remains connected, otherwise to the active operations tab.

## Do's and Don'ts

### Do:

- **Do** use the existing navy, paper, white, and semantic status tokens.
- **Do** pair status colors with words, counts, or icons.
- **Do** preserve compact alignment, tabular numerals, visible keyboard focus, and event-local time labels.
- **Do** retain immediate feedback when reduced motion removes transitions and arrival animation.
- **Do** keep proposals visibly pending until organizer approval.

### Don't:

- **Don't** introduce gradients, stock illustration, decorative metrics, or a competing visual world.
- **Don't** use color alone to communicate a gap, a healthy state, or a pending proposal.
- **Don't** generalize tiny utility metadata or avatar initials into the body-text scale.
- **Don't** assume the workspace reduced-motion selector covers portaled shared components.
