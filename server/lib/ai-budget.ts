import { eq, sql } from "drizzle-orm";
import { createError } from "h3";

import { getDb, schema } from "../db";
export async function consumeAiBudget(
  owner: string | null,
  continuation = false,
  kind: "turn" | "auxiliary" = "turn",
) {
  if (!owner)
    throw createError({
      statusCode: 401,
      statusMessage: "Sign in to use the scheduling agent.",
    });
  if (continuation) return;
  const now = new Date().toISOString(),
    limits = [
      { id: `day:${now.slice(0, 10)}:global`, max: 60 },
      {
        id: `${kind === "turn" ? "hour" : "auxiliary"}:${now.slice(0, 13)}:${owner}`,
        max: kind === "turn" ? 8 : 12,
      },
    ];
  await getDb().transaction(async (tx) => {
    for (const limit of limits) {
      await tx
        .insert(schema.aiUsage)
        .values({ id: limit.id, ownerEmail: owner, count: 0 })
        .onConflictDoNothing();
      const [row] = await tx
        .select()
        .from(schema.aiUsage)
        .where(eq(schema.aiUsage.id, limit.id))
        .for("update");
      if (!row || row.count >= limit.max)
        throw createError({
          statusCode: 429,
          statusMessage:
            "Demo AI request budget reached. The deterministic Repair Center remains available.",
        });
      await tx
        .update(schema.aiUsage)
        .set({ count: sql`${schema.aiUsage.count}+1` })
        .where(eq(schema.aiUsage.id, limit.id));
    }
  });
}
