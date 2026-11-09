import { getDbExec, closeDbExec, sql } from "@agent-native/core/db";
import { loadEnv } from "@agent-native/core/scripts";
loadEnv();
console.log({
  DATABASE_URL: !!process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: !!process.env.BETTER_AUTH_SECRET,
});
try {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (!url.hostname.endsWith(".neon.tech"))
    throw new Error("Expected a Neon connection");
  await getDbExec().execute(sql`SELECT 1 AS ok`);
  console.log("Neon connection verified. No credential values printed.");
} catch {
  console.error("Database verification failed. Connection details withheld.");
  process.exitCode = 1;
} finally {
  await closeDbExec();
}
