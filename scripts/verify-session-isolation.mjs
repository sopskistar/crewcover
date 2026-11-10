import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

import { firefox, request, expect as baseExpect } from "@playwright/test";
const expect = baseExpect.configure({ timeout: 30000 });
const base = "https://crewcover-iota.vercel.app";
const primary = await request.newContext({
  baseURL: base,
  storageState: ".tmp/production-auth-state.json",
});
const list = await primary.get("/_agent-native/actions/list-events");
if (list.status() !== 200)
  throw new Error("Primary QA organizer session unavailable.");
const body = await list.json();
const eventId = (body.events ?? body.result?.events)?.[0]?.id;
if (!eventId) throw new Error("Primary synthetic event unavailable.");
let account;
try {
  account = JSON.parse(await readFile(".tmp/isolation-account.json", "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  account = {
    email: `crewcover-isolation-${Date.now()}@example.test`,
    password: randomBytes(24).toString("base64url") + "aA1!",
    registered: false,
  };
  await writeFile(".tmp/isolation-account.json", JSON.stringify(account), {
    mode: 0o600,
  });
}
const browser = await firefox.launch();
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base + "/sign-in");
  await page
    .getByText(account.registered ? "Sign in" : "Create account", {
      exact: true,
    })
    .first()
    .click();
  const form = page.locator("form.active");
  await form.locator("input[type=email]").fill(account.email);
  await form.locator("input[type=password]").nth(0).fill(account.password);
  if (!account.registered)
    await form.locator("input[type=password]").nth(1).fill(account.password);
  await form.locator("button[type=submit]").click();
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
    timeout: 60000,
  });
  account.registered = true;
  await writeFile(".tmp/isolation-account.json", JSON.stringify(account), {
    mode: 0o600,
  });
  await expect(
    page.getByRole("button", { name: "Open demo conference", exact: true }),
  ).toBeVisible();
  const own = await context.request.get(
    base + "/_agent-native/actions/list-events",
  );
  const ownData = await own.json();
  if ((ownData.events ?? ownData.result?.events)?.length !== 0)
    throw new Error("New organizer unexpectedly sees event data.");
  const foreign = await context.request.get(
    base + "/_agent-native/actions/get-event-coverage",
    { params: { eventId } },
  );
  if (foreign.status() !== 404)
    throw new Error(`Foreign read was not rejected: ${foreign.status()}`);
  const write = await context.request.post(
    base + "/_agent-native/actions/assign-volunteer",
    { data: { eventId, shiftId: "s-1", volunteerId: "v-15" } },
  );
  const blockedBody = await write.json();
  if (write.status() === 409 && !/approval/i.test(JSON.stringify(blockedBody)))
    throw new Error("Direct write returned an unexpected conflict.");
  if (![403, 404, 409].includes(write.status()))
    throw new Error(`Foreign write was not rejected: ${write.status()}`);
  const result = {
    at: new Date().toISOString(),
    url: base,
    newOrganizerEvents: 0,
    foreignRead: foreign.status(),
    foreignWrite: write.status(),
    directHttpWriteGate:
      write.status() === 409 ? "approval-required" : "owner-denied",
    separateBrowserSession: true,
  };
  await writeFile(
    "docs/evidence/session-isolation.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
  await primary.dispose();
}
