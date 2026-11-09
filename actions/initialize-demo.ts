import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireOwner, seedDemo } from "../server/lib/crewcover-store";
import { domain } from "../server/lib/domain-action";
import { SchedulingError } from "../shared/scheduling";

export default defineAction({
  description:
    "Initialize or explicitly reset only the signed-in organizer's fictional demo conference.",
  schema: z.object({
    reset: z
      .boolean()
      .default(false)
      .describe("Reset the existing synthetic conference"),
    confirmation: z
      .string()
      .max(30)
      .default("")
      .describe("Must be RESET DEMO when reset is true"),
  }),
  agentTool: false,
  mcpTool: false,
  run: async (args, ctx) =>
    domain(async () => {
      const owner = requireOwner(ctx);
      if (args.reset && args.confirmation !== "RESET DEMO")
        throw new SchedulingError(
          "Confirm the demo reset.",
          "CONFIRMATION_REQUIRED",
          400,
        );
      return seedDemo(owner, args.reset);
    }),
});
