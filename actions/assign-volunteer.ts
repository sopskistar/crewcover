import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireOwner, mutateEvent } from "../server/lib/crewcover-store";
import { domain } from "../server/lib/domain-action";
import { coverage, assignVolunteer } from "../shared/scheduling";

export default defineAction({
  description:
    "Manually fill an uncovered position with a qualified volunteer after organizer confirmation; all constraints are revalidated.",
  schema: z.object({
    eventId: z
      .string()
      .min(1)
      .max(100)
      .describe("Selected event id returned by list-events"),
    shiftId: z.string().max(100).describe("Shift id"),
    volunteerId: z.string().max(100).describe("Eligible volunteer id"),
  }),
  needsApproval: true,
  run: async (args, ctx) =>
    domain(async () => {
      const owner = requireOwner(ctx);
      return mutateEvent(owner, args.eventId, (s) => ({
        assignment: assignVolunteer(s, args.shiftId, args.volunteerId, owner),
        coverage: coverage(s),
      }));
    }),
});
