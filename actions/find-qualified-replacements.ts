import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { eventLink } from "../server/lib/action-links";
import { requireOwner, readEvent } from "../server/lib/crewcover-store";
import { domain } from "../server/lib/domain-action";
import { candidates } from "../shared/scheduling";

export default defineAction({
  link: ({ args }) =>
    eventLink(args.eventId, "schedule", "View affected shift"),
  description:
    "Rank qualified available volunteers for one vacancy and explain exclusions. No schedule changes.",
  schema: z.object({
    eventId: z
      .string()
      .min(1)
      .max(100)
      .describe("Selected event id returned by list-events"),
    shiftId: z.string().max(100).describe("Uncovered shift id"),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async (args, ctx) =>
    domain(async () => {
      return candidates(
        await readEvent(requireOwner(ctx), args.eventId),
        args.shiftId,
      );
    }),
});
