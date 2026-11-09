import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import type {
  Interval,
  Recommendation,
  Proposal,
} from "../../shared/scheduling";
const child = () => ({
  id: text("id").notNull(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  ownerEmail: text("owner_email").notNull(),
});
export const events = pgTable(
  "cc_events",
  {
    id: text("id").primaryKey(),
    ownerEmail: text("owner_email").notNull(),
    name: text("name").notNull(),
    venue: text("venue").notNull(),
    date: text("date").notNull(),
    timeZone: text("time_zone").notNull(),
    revision: integer("revision").notNull().default(1),
  },
  (t) => [uniqueIndex("cc_events_owner_idx").on(t.ownerEmail)],
);
export const volunteers = pgTable(
  "cc_volunteers",
  {
    ...child(),
    ownerEmail: text("owner_email").notNull(),
    name: text("name").notNull(),
    skills: jsonb("skills").$type<string[]>().notNull(),
    availability: jsonb("availability").$type<Interval[]>().notNull(),
    maxHours: integer("max_hours").notNull(),
    unavailable: boolean("unavailable").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.id] })],
);
export const shifts = pgTable(
  "cc_shifts",
  {
    ...child(),
    ownerEmail: text("owner_email").notNull(),
    role: text("role").notNull(),
    area: text("area").notNull(),
    skill: text("skill").notNull(),
    start: text("start").notNull(),
    end: text("end").notNull(),
    required: integer("required").notNull(),
    priority: text("priority", { enum: ["critical", "standard"] }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.id] })],
);
export const assignments = pgTable(
  "cc_assignments",
  {
    ...child(),
    ownerEmail: text("owner_email").notNull(),
    shiftId: text("shift_id").notNull(),
    volunteerId: text("volunteer_id").notNull(),
    status: text("status", { enum: ["active", "cancelled"] }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.id] })],
);
export const cancellations = pgTable(
  "cc_cancellations",
  {
    ...child(),
    ownerEmail: text("owner_email").notNull(),
    volunteerId: text("volunteer_id").notNull(),
    assignmentId: text("assignment_id").notNull(),
    start: text("start").notNull(),
    end: text("end").notNull(),
    reason: text("reason").notNull(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.id] })],
);
export const proposals = pgTable(
  "cc_proposals",
  {
    ...child(),
    ownerEmail: text("owner_email").notNull(),
    revision: integer("revision").notNull(),
    status: text("status", {
      enum: ["pending", "approved", "rejected"],
    }).notNull(),
    createdAt: text("created_at").notNull(),
    recommendations: jsonb("recommendations")
      .$type<Recommendation[]>()
      .notNull(),
    unresolved: jsonb("unresolved").$type<Proposal["unresolved"]>().notNull(),
    before: integer("coverage_before").notNull(),
    after: integer("coverage_after").notNull(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.id] })],
);
export const decisions = pgTable(
  "cc_decisions",
  {
    ...child(),
    ownerEmail: text("owner_email").notNull(),
    proposalId: text("proposal_id").notNull(),
    outcome: text("outcome", { enum: ["approved", "rejected"] }).notNull(),
    actor: text("actor").notNull(),
    at: text("at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.id] })],
);
export const activity = pgTable(
  "cc_activity",
  {
    ...child(),
    ownerEmail: text("owner_email").notNull(),
    at: text("at").notNull(),
    type: text("type").notNull(),
    message: text("message").notNull(),
    actor: text("actor").notNull(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.id] })],
);
export const aiUsage = pgTable("cc_ai_usage", {
  id: text("id").primaryKey(),
  ownerEmail: text("owner_email").notNull(),
  count: integer("count").notNull().default(0),
});
