import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireOwner, readEvent } from "../server/lib/crewcover-store";
import { domain } from "../server/lib/domain-action";
import { coverage } from "../shared/scheduling";

export default defineAction({
  description: "List shift requirements and persisted staffing coverage.",
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
      return coverage(await readEvent(requireOwner(ctx), args.eventId));
    }),
});
