import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireOwner, readEvent } from "../server/lib/crewcover-store";
import { domain } from "../server/lib/domain-action";

export default defineAction({
  description:
    "List volunteer skills, availability, hour limits and current assignments.",
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
      return { volunteers: state.volunteers, assignments: state.assignments };
    }),
});
