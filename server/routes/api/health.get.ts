import { getDbExec, sql } from "@agent-native/core/db";
import { defineEventHandler, createError } from "h3";
export default defineEventHandler(async () => {
  try {
    const result = await getDbExec().execute(
      sql`SELECT to_regclass('public.cc_events') IS NOT NULL AS app_schema, to_regclass('public.user') IS NOT NULL AS auth_schema`,
    );
    return {
      status: "ok",
      application: "CrewCover",
      framework: "Agent-Native 0.226.0",
      database: "connected",
      schema: result.rows[0],
    };
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: "Database unavailable",
    });
  }
});
