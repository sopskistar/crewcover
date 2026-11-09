import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireOwner, mutateEvent } from "../server/lib/crewcover-store";
import { domain } from "../server/lib/domain-action";
import {
  exclusionReasons,
  record,
  SchedulingError,
} from "../shared/scheduling";

export default defineAction({
  description:
    "Add or update a volunteer profile. Changes must preserve the validity of every active assignment.",
  schema: z.object({
    eventId: z
      .string()
      .min(1)
      .max(100)
      .describe("Selected event id returned by list-events"),
    volunteerId: z
      .string()
      .max(100)
      .optional()
      .describe("Existing volunteer id; omit to add"),
    name: z.string().trim().min(2).max(80).describe("Volunteer display name"),
    skills: z
      .array(
        z.enum([
          "Registration",
          "Safety",
          "Technical",
          "Guest services",
          "Logistics",
        ]),
      )
      .min(1)
      .max(5)
      .describe("Verified qualifications"),
    maxHours: z
      .number()
      .int()
      .min(1)
      .max(24)
      .describe("Maximum working hours for this event"),
    availability: z
      .array(
        z.object({
          start: z.iso.datetime().describe("UTC ISO start instant"),
          end: z.iso.datetime().describe("UTC ISO end instant"),
        }),
      )
      .min(1)
      .max(10)
      .describe("Available UTC intervals"),
  }),
  needsApproval: true,
  run: async (args, ctx) =>
    domain(async () => {
      const owner = requireOwner(ctx);
      return mutateEvent(owner, args.eventId, (s) => {
        if (
          args.availability.some(
            (a) => Date.parse(a.end) <= Date.parse(a.start),
          )
        )
          throw new SchedulingError(
            "Availability must end after it starts.",
            "INVALID_INTERVAL",
            400,
          );
        let v = s.volunteers.find((v) => v.id === args.volunteerId);
        if (args.volunteerId && !v)
          throw new SchedulingError("Volunteer not found.", "NOT_FOUND", 404);
        if (!v) {
          if (s.volunteers.length >= 100)
            throw new SchedulingError(
              "Demo supports up to 100 volunteers.",
              "LIMIT",
              400,
            );
          v = {
            id: crypto.randomUUID(),
            name: args.name,
            skills: args.skills,
            maxHours: args.maxHours,
            availability: args.availability,
            unavailable: false,
          };
          s.volunteers.push(v);
        } else
          Object.assign(v, {
            name: args.name,
            skills: args.skills,
            maxHours: args.maxHours,
            availability: args.availability,
          });
        for (const a of s.assignments.filter(
          (a) => a.volunteerId === v.id && a.status === "active",
        )) {
          const copy = structuredClone(s);
          copy.assignments = copy.assignments.filter((x) => x.id !== a.id);
          const reasons = exclusionReasons(
            copy,
            v,
            s.shifts.find((x) => x.id === a.shiftId)!,
          );
          if (reasons.length)
            throw new SchedulingError(
              "Profile change would invalidate an assignment: " +
                reasons.join("; "),
              "INELIGIBLE",
            );
        }
        s.revision++;
        record(s, "volunteer", v.name + " profile saved.", owner);
        return { volunteer: v };
      });
    }),
});
