import { runMigrations } from "@agent-native/core/db";

export default runMigrations(
  [
    {
      version: 1,
      name: "crewcover_initial_domain",
      sql: `
CREATE TABLE IF NOT EXISTS cc_events (
 id TEXT PRIMARY KEY, owner_email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, venue TEXT NOT NULL,
 date TEXT NOT NULL, time_zone TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0)
);
CREATE TABLE IF NOT EXISTS cc_volunteers (
 event_id TEXT NOT NULL REFERENCES cc_events(id) ON DELETE CASCADE, id TEXT NOT NULL, owner_email TEXT NOT NULL,
 name TEXT NOT NULL, skills JSONB NOT NULL, availability JSONB NOT NULL, max_hours INTEGER NOT NULL CHECK (max_hours > 0 AND max_hours <= 24), unavailable BOOLEAN NOT NULL DEFAULT false,
 PRIMARY KEY(event_id,id)
);
CREATE TABLE IF NOT EXISTS cc_shifts (
 event_id TEXT NOT NULL REFERENCES cc_events(id) ON DELETE CASCADE, id TEXT NOT NULL, owner_email TEXT NOT NULL,
 role TEXT NOT NULL, area TEXT NOT NULL, skill TEXT NOT NULL, start TEXT NOT NULL, "end" TEXT NOT NULL,
 required INTEGER NOT NULL CHECK (required > 0), priority TEXT NOT NULL CHECK (priority IN ('critical','standard')),
 PRIMARY KEY(event_id,id), CHECK ("end" > start)
);
CREATE TABLE IF NOT EXISTS cc_assignments (
 event_id TEXT NOT NULL REFERENCES cc_events(id) ON DELETE CASCADE, id TEXT NOT NULL, owner_email TEXT NOT NULL,
 shift_id TEXT NOT NULL, volunteer_id TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('active','cancelled')),
 PRIMARY KEY(event_id,id), FOREIGN KEY(event_id,shift_id) REFERENCES cc_shifts(event_id,id),
 FOREIGN KEY(event_id,volunteer_id) REFERENCES cc_volunteers(event_id,id)
);
CREATE UNIQUE INDEX IF NOT EXISTS cc_assignment_active_idx ON cc_assignments(event_id,shift_id,volunteer_id) WHERE status='active';
CREATE INDEX IF NOT EXISTS cc_assignments_volunteer_idx ON cc_assignments(event_id,volunteer_id,status);
CREATE TABLE IF NOT EXISTS cc_cancellations (
 event_id TEXT NOT NULL REFERENCES cc_events(id) ON DELETE CASCADE, id TEXT NOT NULL, owner_email TEXT NOT NULL,
 volunteer_id TEXT NOT NULL, assignment_id TEXT NOT NULL, start TEXT NOT NULL, "end" TEXT NOT NULL, reason TEXT NOT NULL,
 PRIMARY KEY(event_id,id), FOREIGN KEY(event_id,assignment_id) REFERENCES cc_assignments(event_id,id)
);
CREATE TABLE IF NOT EXISTS cc_proposals (
 event_id TEXT NOT NULL REFERENCES cc_events(id) ON DELETE CASCADE, id TEXT NOT NULL, owner_email TEXT NOT NULL,
 revision INTEGER NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected')), created_at TEXT NOT NULL,
 recommendations JSONB NOT NULL, unresolved JSONB NOT NULL, coverage_before INTEGER NOT NULL, coverage_after INTEGER NOT NULL,
 PRIMARY KEY(event_id,id)
);
CREATE INDEX IF NOT EXISTS cc_proposal_pending_idx ON cc_proposals(event_id,status,revision);
CREATE TABLE IF NOT EXISTS cc_decisions (
 event_id TEXT NOT NULL REFERENCES cc_events(id) ON DELETE CASCADE, id TEXT NOT NULL, owner_email TEXT NOT NULL,
 proposal_id TEXT NOT NULL, outcome TEXT NOT NULL CHECK(outcome IN ('approved','rejected')), actor TEXT NOT NULL, at TEXT NOT NULL,
 PRIMARY KEY(event_id,id), UNIQUE(event_id,proposal_id), FOREIGN KEY(event_id,proposal_id) REFERENCES cc_proposals(event_id,id)
);
CREATE TABLE IF NOT EXISTS cc_activity (
 event_id TEXT NOT NULL REFERENCES cc_events(id) ON DELETE CASCADE, id TEXT NOT NULL, owner_email TEXT NOT NULL,
 at TEXT NOT NULL, type TEXT NOT NULL, message TEXT NOT NULL, actor TEXT NOT NULL, PRIMARY KEY(event_id,id)
);
CREATE INDEX IF NOT EXISTS cc_activity_time_idx ON cc_activity(event_id,at);
CREATE TABLE IF NOT EXISTS cc_ai_usage (id TEXT PRIMARY KEY, owner_email TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0);
`,
    },
  ],
  { table: "crewcover_app_migrations" },
);
