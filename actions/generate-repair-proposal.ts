import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { eventLink } from "../server/lib/action-links";
import { requireOwner, mutateEvent } from "../server/lib/crewcover-store";
import { domain } from "../server/lib/domain-action";
import { generateProposal } from "../shared/scheduling";

export default defineAction({
  link: ({ args }) =>
    eventLink(args.eventId, "repairs", "Review repair proposal"),
  description:
    "Create a deterministic repair proposal using qualified available volunteers without double-booking. Records a proposal; does not commit assignments. Organizer must approve.",
  schema: z.object({
    eventId: z
      .string()
      .min(1)
      .max(100)
      .describe("Selected event id returned by list-events"),
  }),
  run: async (args, ctx) =>
    domain(async () => {
      const owner = requireOwner(ctx);
      return mutateEvent(owner, args.eventId, (s) => ({
        proposal: generateProposal(s, owner),
      }));
    }),
});
