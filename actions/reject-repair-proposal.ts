import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireOwner, mutateEvent } from "../server/lib/crewcover-store";
import { domain } from "../server/lib/domain-action";
import { decideProposal } from "../shared/scheduling";

export default defineAction({
  description: "Reject a pending proposal without changing assignments.",
  schema: z.object({
    eventId: z
      .string()
      .min(1)
      .max(100)
      .describe("Selected event id returned by list-events"),
    proposalId: z.string().max(100).describe("Pending proposal id"),
  }),
  needsApproval: true,
  run: async (args, ctx) =>
    domain(async () => {
      const owner = requireOwner(ctx);
      return mutateEvent(owner, args.eventId, (s) => ({
        proposal: decideProposal(s, args.proposalId, "rejected", owner),
      }));
    }),
});
