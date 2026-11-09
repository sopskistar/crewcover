import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireOwner, mutateEvent } from "../server/lib/crewcover-store";
import { domain } from "../server/lib/domain-action";
import { coverage, cancelAssignment } from "../shared/scheduling";

export default defineAction({
  description:
    "Cancel an actual assignment after organizer confirmation. Updates persisted coverage and blocks the cancelling volunteer for that interval.",
  schema: z.object({
    eventId: z
      .string()
      .min(1)
      .max(100)
      .describe("Selected event id returned by list-events"),
    assignmentId: z.string().max(100).describe("Active assignment id"),
    reason: z.string().min(1).max(300).describe("Cancellation reason"),
  }),
  needsApproval: true,
  run: async (args, ctx) =>
    domain(async () => {
      const owner = requireOwner(ctx);
      return mutateEvent(owner, args.eventId, (s) => ({
        assignment: cancelAssignment(s, args.assignmentId, args.reason, owner),
        coverage: coverage(s),
      }));
    }),
});
