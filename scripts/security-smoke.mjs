import { readFile, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";

import { request } from "@playwright/test";

const base = "https://crewcover-iota.vercel.app";
const secrets = [];
for (const file of [".env", ".env.local"]) {
  try {
    for (const [key, value] of Object.entries(
      parseEnv(await readFile(file, "utf8")),
    ))
      if (
        /KEY|SECRET|TOKEN|PASSWORD|DATABASE_URL/i.test(key) &&
        value.length >= 20
      )
        secrets.push(value);
  } catch (error) {
    if (error.code !== "ENOENT")
      throw new Error("Unable to inspect server environment safely.");
  }
}
const anonymous = await request.newContext({ baseURL: base });
const authenticated = await request.newContext({
  baseURL: base,
  storageState: ".tmp/production-auth-state.json",
});
try {
  const reads = await anonymous.get("/_agent-native/actions/list-events", {
    maxRedirects: 0,
  });
  const chat = await anonymous.post("/_agent-native/agent-chat", {
    data: { message: "Check my staffing coverage." },
    maxRedirects: 0,
  });
  const denied = (status) => [401, 403, 404].includes(status);
  if (!denied(reads.status()) || !denied(chat.status()))
    throw new Error(
      `Anonymous access was not denied: actions=${reads.status()}, chat=${chat.status()}`,
    );
  const results = [];
  let matches = 0;
  for (const path of [
    "/operations",
    "/_agent-native/actions/list-events",
    "/api/health",
  ]) {
    const response = await authenticated.get(path);
    const body = await response.text();
    if (response.status() !== 200)
      throw new Error(
        `Authenticated verification failed at ${path}: HTTP ${response.status()}`,
      );
    if (secrets.some((secret) => body.includes(secret))) matches++;
    if (path === "/api/health") {
      const health = JSON.parse(body);
      if (
        health.database !== "connected" ||
        !health.schema?.app_schema ||
        !health.schema?.auth_schema
      )
        throw new Error("Production database/schema check failed.");
    }
    results.push({ path, status: response.status() });
  }
  if (matches)
    throw new Error(
      "Credential match detected in a response; details withheld.",
    );
  const result = {
    at: new Date().toISOString(),
    url: base,
    anonymousActionsStatus: reads.status(),
    anonymousChatStatus: chat.status(),
    authenticated: results,
    credentialMatches: matches,
  };
  await writeFile(
    "docs/evidence/security.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await anonymous.dispose();
  await authenticated.dispose();
}
