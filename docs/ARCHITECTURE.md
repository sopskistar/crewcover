# CrewCover architecture

CrewCover extends the official standalone Agent-Native Chat starter. React 19 and React Router 8 render the operations workspace; Vite and Agent-Native/Nitro build the client and server. AgentKit supplies the real contextual agent panel and durable conversation UI. Core owns authentication, provider resolution, action transport, application state, database connections and migration execution.

## Shared contract

`actions/` contains typed Zod `defineAction` operations. React calls them through `useActionQuery` and `useActionMutation`. The agent loads the same registry. Both paths call `server/lib/crewcover-store.ts` and the deterministic functions in `shared/scheduling.ts`. There is no separate chatbot simulation or parallel schedule store.

The URL stores the current workspace view and selected event. `useNavigationState` shares those with Agent-Native application state. Current-screen context guides the agent; `get-event-coverage` supplies fresh persisted facts. Tool completions invalidate action queries through the framework's standard integration.

## Persistence and isolation

Neon PostgreSQL uses the framework's `createGetDb` Drizzle adapter. App tables are `cc_events`, `cc_volunteers`, `cc_shifts`, `cc_assignments`, `cc_cancellations`, `cc_proposals`, `cc_decisions`, `cc_activity`, and `cc_ai_usage`. Volunteer qualifications and availability intervals are structured JSONB fields in the volunteer row; proposals hold their candidate recommendations as JSONB. Assignment and decision references have database foreign keys and uniqueness constraints.

Each organizer owns one private synthetic event. Every action derives identity from authenticated context and scopes the event and its children to that owner. Other users cannot access an event merely by knowing its id. Volunteer accounts and shared multi-organizer workflows are outside this MVP.

All event mutations serialize on the event row using `SELECT … FOR UPDATE`. Approval checks the stored schedule revision, validates each candidate against provisional assignments, then persists assignments, the decision and audit entries in one transaction. Duplicate approval is rejected. Changes to the schedule or volunteer constraints make earlier proposals stale.

## Scheduling

Times are normalized UTC instants. Overlap uses half-open intervals; a shift ending at noon does not conflict with one beginning at noon. Eligibility requires full-shift availability, the exact qualification, no overlapping active assignment or cancellation interval, and remaining event-hour capacity. Candidate ranking prefers fewer assigned hours, then stable volunteer id. Repairs process critical roles first and account for provisional recommendations across gaps. Unfillable positions remain visible.

The deterministic engine makes no model requests. Gemini explains and orchestrates the same actions, while the organizer reviews proposed changes. Mutating high-impact tools use framework approval metadata. Raw SQL tools and production code execution are disabled for the agent.

## Inference protection

Authenticated inference is limited by PostgreSQL counters to eight chat turns and twelve auxiliary requests per organizer per UTC hour, and sixty requests across the deployment per UTC day. Auxiliary middleware covers chat-title and voice inference routes. Counter updates are transactional; framework-authorized continuations are not charged as new turns. Output is capped through Agent-Native configuration. No automatic OpenRouter fallback is claimed: its provider can be selected manually in supported agent settings.

## Deployment

The existing Vercel project and Neon integration are retained. The official production migration command applies framework and app release migrations. A Nitro Vercel build emits `.vercel/output`. The scheduled sweep uses `0 9 * * *`, compatible with Vercel Hobby, and a secret bearer credential. The MVP's staffing flow does not depend on a scheduled job.
