import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { eventLink } from "../server/lib/action-links";
import { requireOwner, readEvent } from "../server/lib/crewcover-store";
import { domain } from "../server/lib/domain-action";
import { coverage } from "../shared/scheduling";

export default defineAction({
  link: ({ args }) =>
    eventLink(args.eventId, "overview", "Open event coverage"),
  description:
    "Read actual coverage and event state. Gaps and uncoveredPositions count volunteer positions; durationHours gives each shift's duration in hours.",
  schema: z.object({
    eventId: z
      .string()
      .min(1)
      .max(100)
      .describe("Selected event id returned by list-events"),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async (args, ctx) =>
    domain(async () => {
      const state = await readEvent(requireOwner(ctx), args.eventId);
      return { id: state.id, coverage: coverage(state), state };
    }),
});
