import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireOwner } from "../server/lib/crewcover-store";
import { domain } from "../server/lib/domain-action";

export default defineAction({
  description: "List the authenticated organizer's events.",
  schema: z.object({}),
  http: { method: "GET" },
  readOnly: true,
  run: async (args, ctx) =>
    domain(async () => {
      const owner = requireOwner(ctx);
      const { getDb, schema } = await import("../server/db");
      const { eq } = await import("drizzle-orm");
      return {
        events: await getDb()
          .select({
            id: schema.events.id,
            name: schema.events.name,
            date: schema.events.date,
            timeZone: schema.events.timeZone,
            venue: schema.events.venue,
          })
          .from(schema.events)
          .where(eq(schema.events.ownerEmail, owner))
          .limit(20),
      };
    }),
});
