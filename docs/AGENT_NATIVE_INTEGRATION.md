# Agent-Native integration

CrewCover extends the official standalone Chat starter; it is not a separate generic chatbot architecture.

- `server/plugins/agent-chat.ts` mounts the genuine Agent-Native agent runtime with the generated action registry. Initial tools include event discovery, current coverage, qualified candidates and deterministic repair proposals. Raw database tools, automation tools and production code execution are disabled for the agent.
- `actions/` defines the same typed operations that React uses through Core's action hooks. The agent does not generate a parallel schedule or directly write unchecked assignments.
- `server/lib/crewcover-store.ts` scopes reads to the authenticated organizer and serializes mutations in transactions using an event-row lock.
- `shared/scheduling.ts` implements deterministic qualifications, full availability, cancellation intervals, half-open overlap checks, hour limits, candidate ranking, proposal generation and revalidation.
- `app/components/layout/AgentInspector.tsx` retains the real Toolkit `AgentSidebar`, durable conversations and supported transport. Domain buttons open and focus the supported agent composer; the selected event is supplied through shared navigation context.
- `app/hooks/use-navigation-state.ts` shares the current view, URL and event id with the agent through Core application state. Tool completions refresh action queries through the framework.
- High-impact mutations declare `needsApproval`; the UI also uses explicit cancellation and repair confirmation dialogs. Pending proposals never update assignments.
- `server/plugins/agent-native-email-branding.ts` selects Gemini as the primary engine using Core's configuration surface. OpenRouter remains a manual provider alternative; no automatic failover is claimed.
- `server/lib/ai-budget.ts` enforces persisted, transactional request budgets. Secrets are resolved by Core's supported provider integration and never sent by the frontend.
- `server/plugins/00-neon-transport.ts` configures the framework's existing Neon driver with a documented Node WebSocket constructor; it creates no separate pool or database client.

## Proof status

The database integration suite has executed the actual `defineAction` objects for coverage, cancellation, proposal generation and approval against PostgreSQL semantics. It verifies owner isolation, persistence, duplicate decisions and concurrent/stale approval protection. The browser suite checks that interface interactions use the corresponding registered action routes.

The final deployed release passed a complete live Gemini workflow in one run. Gemini called `get-event-coverage` and `generate-repair-proposal`, saved three eligible recommendations, and left coverage at 85% pending human approval. The UI approval persisted 100% coverage. After another cancellation and validated manual assignment, a fresh Gemini tool call returned 100% at schedule revision 94. The sanitized observation is in `docs/evidence/agent-proof.json` (`resumedVerification:false`).

Earlier investigation exposed two evidence-harness issues: a hidden duplicate model label and mixed chunks from concurrent responses. Both were corrected before this complete final run. The collector records separate real responses, parses actual tool frames and returns the original response untouched. No inference, server response or tool call was mocked.

Reproduce with `node scripts/production-auth.mjs https://crewcover-iota.vercel.app --firefox`, then `node scripts/live-agent-proof.mjs --firefox`. Private QA credentials/session files remain ignored and restricted. The helper creates a synthetic QA fixture when absent. The proof resets only that organizer's fictional event and makes actual provider requests.
