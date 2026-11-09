# CrewCover

CrewCover is an agent-native workforce scheduling app that detects staffing gaps, intelligently repairs shift assignments, and keeps humans in control of every change. Built with Builder.io Agent-Native.

**Application:** [crewcover-iota.vercel.app](https://crewcover-iota.vercel.app)  
**Public Clips recording:** pending the owner's recording and verified public link.

When volunteers cancel shortly before an event, an organizer needs more than a suggested name. CrewCover checks availability, qualifications, overlapping work, cancellations and hour limits, produces a concrete repair, and waits for human approval before changing the schedule.

The organizer and Gemini use the same typed Agent-Native actions and persisted Neon records. The agent explains gaps and creates proposals; the deterministic engine decides eligibility. Manual changes appear in the agent's next coverage read. Stale or duplicate approvals cannot force conflicting assignments into the schedule.

## What works

- Event overview and visual role/time schedule with actual coverage.
- Volunteer search, skills, availability, hour limits and profile creation/editing.
- Confirmed cancellations and validated manual assignments.
- Ranked replacements, exclusions, unresolved gaps and proposal comparison.
- Explicit approve/reject decisions, transactional assignments and activity history.
- Genuine embedded Agent-Native chat, Gemini action execution and current-event context.
- Private organizer workspaces, authenticated actions, inference budgets and safe demo reset.

## Run locally

Use **Node.js 24.22.2** and pinned **pnpm 10.29.1** through Corepack. This is the official standalone Agent-Native Chat foundation with React Router, Vite and Nitro.

```bash
nvm use
corepack pnpm install --frozen-lockfile
cp .env.example .env
# Fill server-only credentials in .env; never commit it.
corepack pnpm migrate:production
corepack pnpm dev
```

Use a separate development database when developing independently. The migration command uses the framework's idempotent release-migration workflow, without schema push. Required settings are `DATABASE_URL`, `BETTER_AUTH_SECRET` and `GOOGLE_GENERATIVE_AI_API_KEY`. The optional direct Neon connection must point to the same database. Set `BETTER_AUTH_URL` only when automatic origin detection is insufficient. OpenRouter is a manual alternative, not automatic fallback.

Sign up or sign in, then choose **Open demo conference**. Each organizer owns a private fictional conference. Credentials and authentication fixtures remain outside Git.

For isolated local development, the framework also supports persisted PGlite PostgreSQL:

```bash
corepack pnpm migrate:local
corepack pnpm dev:local
```

These explicit commands use an ignored local database and preserve your `.env`. On this WSL host, Nitro's development connection to Neon timed out despite a successful standalone Neon query; the local option avoids that transport issue. Production continues to use the existing Neon database. The local-only **Continue as local dev** button is supplied by the framework.

The standard Node preview was verified with real Neon authentication and persisted schedule data:

```bash
corepack pnpm build:node
NITRO_PORT=8091 corepack pnpm start:local
```

`start:local` loads server-only environment files. The canonical Agent-Native Node preset also packages its required Yjs SSR runtime. Vite hot reload remains a host-specific limitation in this WSL session; the deployed application and Node preview have been exercised directly.

## Reproduce the demonstration

1. Choose **Reset demo**, then **Reset conference**. Coverage starts at 100%.
2. Cancel morning assignments for Ada Okafor, Noah Patel and Mia Chen. Coverage becomes 85%.
3. Ask the agent: “Three volunteers have cancelled. Find qualified replacements without double-booking anyone.”
4. Open Repair Center and inspect the recommendations. Pending proposals have not changed coverage.
5. Choose **Review & approve**, then **Approve & apply repair**. Coverage returns to 100%; refresh and inspect Activity.
6. Cancel Leo Mensah's morning Guest assistance assignment. Select its uncovered position and manually assign an eligible volunteer. Ask the agent to recheck persisted coverage.

Repair Center works without inference. Reset affects only your synthetic event; it preserves accounts and other organizers' events. See the [judge and Clips walkthrough](docs/JUDGE_WALKTHROUGH.md) for the 2–3 minute recording script.

## Genuine operations, synthetic people

Gather 2026 and its twenty volunteer profiles are fictional demonstration material. Coverage, cancellations, recommendations, approvals, assignments, database writes, agent tool calls and audit entries are real application operations. No adoption or customer metrics are invented.

## Validation

```bash
corepack pnpm typecheck
corepack pnpm agent-native:doctor
corepack pnpm test
corepack pnpm build:vercel
```

The browser suite requires an ignored authenticated fixture. See [TESTING.md](docs/TESTING.md) for executed results, production browser commands, live Gemini evidence and practical limits. Never copy session files into public artifacts.

## Deploy the existing project

CrewCover uses the existing Vercel `crewcover` project, its Neon integration and production URL above. Preserve these resources and environment variables. Follow the [official Agent-Native Vercel guide](https://www.agent-native.com/docs/vercel/) and [Neon guide](https://www.agent-native.com/docs/neon/).

```bash
corepack pnpm migrate:production
corepack pnpm build:vercel
corepack pnpm dlx vercel@latest deploy --prebuilt --prod
```

The project uses Node 24, the Other preset and official Nitro Vercel output. `AGENT_NATIVE_VERCEL_CRON_SCHEDULE="0 9 * * *"` keeps the generated sweep compatible with Hobby; production has a separate `CRON_SECRET`. No Redis, worker host or Docker service is required.

## Limits

This MVP supports one private event per organizer, not shared organizations or volunteer logins. It repairs gaps without moving existing assignments; reassignment is an explicit cancel-and-assign operation. Cancellation marks unavailability during that shift. Skills and availability are organizer-maintained data, not externally certified information. Ranking is deterministic, not a global optimizer.

Gemini explanations can make mistakes; the persisted proposal and validated schedule are authoritative. Inference is capped at eight chat turns and twelve auxiliary requests per organizer per UTC hour, with sixty total admitted requests per deployment per UTC day. Provider availability and free-tier quotas can interrupt chat; deterministic scheduling remains usable. OpenRouter can be selected manually and has not been certified as automatic fallback.

## Project notes

- [Architecture](docs/ARCHITECTURE.md)
- [Agent-Native integration and proof](docs/AGENT_NATIVE_INTEGRATION.md)
- [Testing record](docs/TESTING.md)
- [Judge and public Clips walkthrough](docs/JUDGE_WALKTHROUGH.md)
- [Final handover](docs/FINAL_HANDOVER.md)
- [Brand assets](docs/BRAND.md)

The original starter README and design notes remain in `docs/framework/`. The repository's original license and Git history are preserved.
