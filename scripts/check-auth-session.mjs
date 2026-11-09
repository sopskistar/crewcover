import { mkdir } from "node:fs/promises";

import { request } from "@playwright/test";
await mkdir(".tmp", { recursive: true });
const api = await request.newContext({ baseURL: "http://localhost:8080" });
const response = await api.get("/operations", { timeout: 90000 });
console.log("Local framework sign-in HTTP", response.status());
const session = await api.get("/_agent-native/auth/session", {
  timeout: 30000,
});
let body;
try {
  body = await session.json();
} catch {}
console.log(
  "Session response HTTP",
  session.status(),
  "keys",
  body ? Object.keys(body) : [],
);
console.log("Authenticated local session:", !!(body?.user || body?.email));
if (body?.user || body?.email)
  await api.storageState({ path: ".tmp/auth-state.json" });
await api.dispose();
