import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireOwner, readEvent } from "../server/lib/crewcover-store";
import { domain } from "../server/lib/domain-action";
import { SchedulingError } from "../shared/scheduling";

export default defineAction({
  description:
    "Read actual availability and current assignments for one volunteer.",
  schema: z.object({
    eventId: z
      .string()
      .min(1)
      .max(100)
      .describe("Selected event id returned by list-events"),
    volunteerId: z.string().max(100).describe("Volunteer id"),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async (args, ctx) =>
    domain(async () => {
      const s = await readEvent(requireOwner(ctx), args.eventId);
      const volunteer = s.volunteers.find((v) => v.id === args.volunteerId);
      if (!volunteer)
        throw new SchedulingError("Volunteer not found.", "NOT_FOUND", 404);
      return {
        volunteer,
        assignments: s.assignments.filter(
          (a) => a.volunteerId === volunteer.id,
        ),
      };
    }),
});
