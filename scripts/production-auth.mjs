import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";

import { chromium, firefox } from "@playwright/test";
const base = process.argv[2] ?? "https://crewcover-iota.vercel.app";
await mkdir(".tmp", { recursive: true, mode: 0o700 });
await chmod(".tmp", 0o700);
let account;
try {
  account = JSON.parse(await readFile(".tmp/qa-account.json", "utf8"));
} catch (error) {
  if (error.code !== "ENOENT")
    throw new Error(
      "Unable to read the private QA fixture. Inspect it locally.",
    );
  account = {
    email: `crewcover-qa-${Date.now()}@example.test`,
    password: `${randomBytes(24).toString("base64url")}aA1!`,
    registered: false,
  };
  await writeFile(".tmp/qa-account.json", JSON.stringify(account), {
    mode: 0o600,
  });
}
const browser = await (
  process.argv.includes("--firefox") ? firefox : chromium
).launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
page.on("pageerror", (e) =>
  console.log("Page error:", e.message.slice(0, 300)),
);
page.on("response", (r) => {
  if (r.status() >= 400 && new URL(r.url()).origin === base)
    console.log("HTTP", r.status(), new URL(r.url()).pathname);
});
try {
  await page.goto(base + "/sign-in", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  const localDev =
    base.includes("localhost") && !process.argv.includes("--production-mode");
  if (localDev) {
    await page
      .getByRole("button", { name: "Continue as local dev", exact: true })
      .click();
  } else {
    await page
      .getByText("Create account", { exact: true })
      .first()
      .waitFor({ timeout: 60000 });
    if (!account.registered) {
      await page.getByText("Create account", { exact: true }).first().click();
      const form = page.locator("form.active");
      await form.locator("input[type=email]").fill(account.email);
      await form.locator("input[type=password]").nth(0).fill(account.password);
      await form.locator("input[type=password]").nth(1).fill(account.password);
      await form.locator("button[type=submit]").click();
    } else {
      await page.getByText("Sign in", { exact: true }).first().click();
      const form = page.locator("#login-form.active");
      await form.locator("input[type=email]").fill(account.email);
      await form.locator("input[type=password]").fill(account.password);
      await form.locator("button[type=submit]").click();
    }
  }
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
    timeout: 60000,
    waitUntil: "domcontentloaded",
  });
  if (!localDev) {
    account.registered = true;
    await writeFile(".tmp/qa-account.json", JSON.stringify(account), {
      mode: 0o600,
    });
  }
  const statePath = base.includes("localhost")
    ? ".tmp/auth-state.json"
    : ".tmp/production-auth-state.json";
  await context.storageState({ path: statePath });
  await chmod(statePath, 0o600);
  console.log("Signup/sign-in succeeded with a synthetic QA organizer.");
  const open = page.getByRole("button", {
    name: "Open demo conference",
    exact: true,
  });
  await Promise.race([
    open.waitFor({ timeout: 60000 }),
    page
      .getByRole("heading", { name: "Gather 2026", exact: true })
      .waitFor({ timeout: 60000 }),
  ]);
  if (await open.isVisible()) await open.click();
  await page
    .getByRole("heading", { name: "Gather 2026", exact: true })
    .waitFor({ timeout: 60000 });
  console.log(
    "Real persisted conference rendered. Coverage:",
    await page.getByTestId("coverage-percentage").innerText(),
  );
  await page.screenshot({
    path: ".impeccable/review/desktop-initial.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: ".impeccable/review/mobile-initial.png",
    fullPage: true,
  });
} catch (error) {
  console.log(
    "Authentication/browser check failed:",
    error.message.slice(0, 500),
  );
  console.log(
    "Visible page:",
    (await page.locator("body").innerText()).slice(0, 1800),
  );
  await page.screenshot({
    path: ".impeccable/review/auth-error.png",
    fullPage: true,
  });
  process.exitCode = 1;
} finally {
  await browser.close();
}
