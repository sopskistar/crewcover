import { and, eq, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { createDemo } from "../../shared/demo";
import { SchedulingError, type EventState } from "../../shared/scheduling";
import { getDb, schema as t } from "../db";
type DB = ReturnType<typeof getDb>;
type TX = Parameters<Parameters<DB["transaction"]>[0]>[0];
type Reader = DB | TX;
export function requireOwner(ctx: { userEmail?: string } | undefined) {
  if (!ctx?.userEmail)
    throw new SchedulingError(
      "Sign in to manage event staffing.",
      "UNAUTHENTICATED",
      401,
    );
  return ctx.userEmail;
}
export async function readEvent(
  owner: string,
  id?: string,
  db: Reader = getDb(),
): Promise<EventState> {
  const [event] = await db
    .select()
    .from(t.events)
    .where(
      and(eq(t.events.ownerEmail, owner), id ? eq(t.events.id, id) : undefined),
    )
    .limit(1);
  if (!event)
    throw new SchedulingError(
      "Event not found. Initialize your fictional conference first.",
      "NOT_FOUND",
      404,
    );
  const filter = (table: { eventId: AnyPgColumn; ownerEmail: AnyPgColumn }) =>
    and(eq(table.eventId, event.id), eq(table.ownerEmail, owner));
  const [
    volunteers,
    shifts,
    assignments,
    cancellations,
    proposals,
    decisions,
    activity,
  ] = await Promise.all([
    db.select().from(t.volunteers).where(filter(t.volunteers)).limit(200),
    db.select().from(t.shifts).where(filter(t.shifts)).limit(200),
    db.select().from(t.assignments).where(filter(t.assignments)).limit(1000),
    db
      .select()
      .from(t.cancellations)
      .where(filter(t.cancellations))
      .limit(1000),
    db.select().from(t.proposals).where(filter(t.proposals)).limit(500),
    db.select().from(t.decisions).where(filter(t.decisions)).limit(500),
    db.select().from(t.activity).where(filter(t.activity)).limit(2000),
  ]);
  return {
    ...event,
    volunteers: volunteers.sort((a, b) => a.name.localeCompare(b.name)),
    shifts: shifts.sort(
      (a, b) =>
        a.start.localeCompare(b.start) ||
        a.id.localeCompare(b.id, undefined, { numeric: true }),
    ),
    assignments,
    cancellations,
    proposals,
    decisions,
    activity: activity.sort((a, b) => a.at.localeCompare(b.at)),
  };
}
async function saveState(state: EventState, owner: string, tx: TX) {
  const withScope = <T extends object>(items: T[]) =>
    items.map((row) => ({ ...row, eventId: state.id, ownerEmail: owner }));
  await tx
    .update(t.events)
    .set({ revision: state.revision })
    .where(eq(t.events.id, state.id));
  if (state.volunteers.length)
    await tx
      .insert(t.volunteers)
      .values(withScope(state.volunteers))
      .onConflictDoUpdate({
        target: [t.volunteers.eventId, t.volunteers.id],
        set: {
          name: sql`excluded.name`,
          skills: sql`excluded.skills`,
          availability: sql`excluded.availability`,
          maxHours: sql`excluded.max_hours`,
          unavailable: sql`excluded.unavailable`,
        },
      });
  if (state.shifts.length)
    await tx
      .insert(t.shifts)
      .values(withScope(state.shifts))
      .onConflictDoNothing();
  if (state.assignments.length)
    await tx
      .insert(t.assignments)
      .values(withScope(state.assignments))
      .onConflictDoUpdate({
        target: [t.assignments.eventId, t.assignments.id],
        set: { status: sql`excluded.status` },
      });
  if (state.cancellations.length)
    await tx
      .insert(t.cancellations)
      .values(withScope(state.cancellations))
      .onConflictDoNothing();
  if (state.proposals.length)
    await tx
      .insert(t.proposals)
      .values(withScope(state.proposals))
      .onConflictDoUpdate({
        target: [t.proposals.eventId, t.proposals.id],
        set: { status: sql`excluded.status` },
      });
  if (state.decisions.length)
    await tx
      .insert(t.decisions)
      .values(withScope(state.decisions))
      .onConflictDoNothing();
  if (state.activity.length)
    await tx
      .insert(t.activity)
      .values(withScope(state.activity))
      .onConflictDoNothing();
}
export async function mutateEvent<T>(
  owner: string,
  id: string,
  operation: (state: EventState) => T,
): Promise<T> {
  return getDb().transaction(async (tx) => {
    const [event] = await tx
      .select({ id: t.events.id })
      .from(t.events)
      .where(and(eq(t.events.id, id), eq(t.events.ownerEmail, owner)))
      .for("update");
    if (!event) throw new SchedulingError("Event not found.", "NOT_FOUND", 404);
    const state = await readEvent(owner, id, tx),
      result = operation(state);
    await saveState(state, owner, tx);
    return result;
  });
}
export async function seedDemo(owner: string, reset = false) {
  return getDb().transaction(async (tx) => {
    const initial = createDemo(owner);
    const inserted = await tx
      .insert(t.events)
      .values({
        id: initial.id,
        ownerEmail: owner,
        name: initial.name,
        venue: initial.venue,
        date: initial.date,
        timeZone: initial.timeZone,
        revision: initial.revision,
      })
      .onConflictDoNothing({ target: t.events.ownerEmail })
      .returning({ id: t.events.id });
    const [existing] = await tx
      .select()
      .from(t.events)
      .where(eq(t.events.ownerEmail, owner))
      .for("update");
    if (!existing)
      throw new SchedulingError(
        "Could not initialize event. Please retry.",
        "INITIALIZE_FAILED",
        503,
      );
    if (!inserted.length && !reset) return { id: existing.id };
    if (!inserted.length) {
      // Only this authenticated owner's synthetic event; no schema or other event is touched.
      for (const table of [
        t.decisions,
        t.activity,
        t.cancellations,
        t.proposals,
        t.assignments,
        t.shifts,
        t.volunteers,
      ])
        await tx.delete(table).where(eq(table.eventId, existing.id));
    }
    const state = createDemo(owner, existing.id);
    if (!inserted.length) state.revision = existing.revision + 1;
    await saveState(state, owner, tx);
    return { id: state.id };
  });
}
