# CrewCover — Agent Guide

CrewCover repairs emergency conference staffing. `/operations` is the authenticated home; Chat stays at `/chat`. UI and agent share typed actions, deterministic constraints and SQL state. Every repair requires organizer approval.

## Skills

Search with `rg --hidden --follow`; read the exact linked guide before deeper work. `docs/framework/agent-guides/skills/build-an-app/SKILL.md` — start here for vague requests to create a domain app. `docs/framework/agent-guides/skills/adding-a-feature/SKILL.md` — cross-area feature checklist. Data/integrations: `docs/framework/agent-guides/skills/actions/SKILL.md`, `docs/framework/agent-guides/skills/storing-data/SKILL.md`, `docs/framework/agent-guides/skills/security/SKILL.md`, `docs/framework/agent-guides/skills/secrets/SKILL.md`, `docs/framework/agent-guides/skills/sharing/SKILL.md`. UI: `docs/framework/agent-guides/skills/frontend-design/SKILL.md`, `docs/framework/agent-guides/skills/shadcn-ui/SKILL.md`, `docs/framework/agent-guides/skills/client-side-routing/SKILL.md`. Agent context/workflows: `docs/framework/agent-guides/skills/context-awareness/SKILL.md`, `docs/framework/agent-guides/skills/real-time-sync/SKILL.md`, `docs/framework/agent-guides/skills/reliable-mutations/SKILL.md`, `docs/framework/agent-guides/skills/performance/SKILL.md`, `docs/framework/agent-guides/skills/delegate-to-agent/SKILL.md`. Framework: `docs/framework/agent-guides/skills/agent-native-docs/SKILL.md`, `docs/framework/agent-guides/skills/agent-native-toolkit/SKILL.md`, `docs/framework/agent-guides/skills/customizing-agent-native/SKILL.md`.

Use local framework docs: `pnpm action docs-search --query "<topic>"`, `pnpm action docs-search --slug "<slug>"`, `pnpm action docs-search --list`, `pnpm action source-search --query "<pattern>"`, `pnpm action source-search --path <path>`, or `pnpm action source-search --list`. For external-agent integrations, read `pnpm action docs-search --slug "external-agents"`.

## Core rules

- UI feedback: target 100 ms, never exceed 400 ms; acknowledge before network work.
- Normal app data must flow through actions. Keep actions deterministic and focused; use agent chat/AgentSidebar for AI work and follow-ups in the same thread. Keep structured state in SQL and large files in configured storage; persist references only.
- For external integrations, inspect the workspace/provider connection catalog first; reuse its scoped resolver. Never hardcode credentials, webhook URLs, or private/customer data.
- Never fabricate. Report failures and recover; verify writes by reading the row or screen. Navigation is in `<current-screen>`; use `view-screen` for fresh visible-record details.

For custom branding, keep `server/plugins/agent-native-email-branding.ts` aligned: `app.name` appears in transactional email and optional `app.logoUrl` must be an absolute HTTPS URL.

## Application state

- `navigation` describes the view and selected ids. Chat is at `/chat`; `/` is a public, read-only introduction; `/sign-in` is the framework sign-in/signup screen.
- Use `navigate` when supported and `view-screen` for a fresh read of visible details; basic navigation is already in `<current-screen>`.

## Development and verification

Keep `/operations` as the primary workflow and preserve the shared Sidebar and AgentInspector. Read the linked feature, Toolkit and customization guides before changing their contracts. Run typecheck, doctor, domain tests, production build and browser checks for the affected workflow. Production verification and deployment follow the user's explicit full-build requirements.

## CrewCover domain

Scope every record by authenticated `ctx.userEmail`; event children inherit the selected event. Volunteers are fictional profiles, not accounts. UI views: `/operations?view=overview|schedule|volunteers|repairs|activity&eventId=<id>`. Navigation includes `eventId` and `workspaceView`.

Use UTC ISO instants and half-open intervals; display the event time zone. Every write locks the event row. Never bypass availability, qualifications, overlap, cancellation or hour limits. Pending repairs do not change assignments. Approval revalidates the revision and every recommendation atomically. On STALE_PROPOSAL regenerate; never force approval. Read coverage after writes and manual changes.

| Action                      | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| list-events                 | get accessible event ids                                  |
| get-event-coverage          | read actual schedule, coverage and proposals              |
| list-volunteers             | read skills, availability and assignments                 |
| get-volunteer-availability  | inspect one profile                                       |
| list-shifts                 | read requirements and gaps                                |
| find-qualified-replacements | rank eligible candidates; explain exclusions              |
| cancel-assignment           | confirmed cancellation and coverage update                |
| generate-repair-proposal    | propose compatible replacements; await review             |
| approve-repair-proposal     | explicitly approved atomic repair                         |
| reject-repair-proposal      | decline without schedule changes                          |
| assign-volunteer            | validated manual assignment                               |
| update-volunteer            | add/edit a profile; preserve existing assignment validity |
| get-activity-history        | read recorded changes                                     |

Schedule drag-and-drop stages a vacancy fill for explicit UI approval and calls the same `assign-volunteer` action. It never calls `cancel-assignment` to transfer a person. Chat includes the selected eventId in navigation and links back to the operations views. Public `/` uses `rootAuth: false`, exact `publicPaths`, and `AppProviders isPublicPath`; no scheduling actions are called there.

`initialize-demo` is UI-only and resets only the organizer's synthetic event after confirmation. Never invent success or tool results. Gemini is primary; OpenRouter is a manual alternative. Inference has persisted request budgets; deterministic repairs remain available without inference.
