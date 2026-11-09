import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { eventLink } from "../server/lib/action-links";
import { requireOwner, mutateEvent } from "../server/lib/crewcover-store";
import { domain } from "../server/lib/domain-action";
import { coverage, decideProposal } from "../shared/scheduling";

export default defineAction({
  link: ({ args }) =>
    eventLink(args.eventId, "activity", "See staffing changes"),
  description:
    "Approve and atomically apply a pending repair only with explicit organizer approval. Rechecks qualifications, availability, overlap, hours and schedule revision.",
  schema: z.object({
    eventId: z
      .string()
      .min(1)
      .max(100)
      .describe("Selected event id returned by list-events"),
    proposalId: z
      .string()
      .max(100)
      .describe("Pending proposal id explicitly approved by organizer"),
  }),
  needsApproval: true,
  run: async (args, ctx) =>
    domain(async () => {
      const owner = requireOwner(ctx);
      return mutateEvent(owner, args.eventId, (s) => ({
        proposal: decideProposal(s, args.proposalId, "approved", owner),
        coverage: coverage(s),
      }));
    }),
});
