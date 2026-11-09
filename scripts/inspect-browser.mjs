import { mkdir } from "node:fs/promises";

import { chromium } from "@playwright/test";
await mkdir(".impeccable/review", { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (e) =>
  console.log("Page error:", e.message.slice(0, 350)),
);
page.on("response", (r) => {
  if (r.status() >= 400 && r.url().includes("localhost"))
    console.log("HTTP", r.status(), new URL(r.url()).pathname);
});
try {
  await page.goto(
    (process.argv[2] ?? "http://localhost:8080") + "/operations",
    { waitUntil: "domcontentloaded", timeout: 90000 },
  );
  await page
    .getByRole("heading", {
      name: /Gather 2026|A ready crew|Sign in|Unable to load/,
    })
    .first()
    .waitFor({ timeout: 90000 })
    .catch(() => {});
  await page.waitForTimeout(1500);
  console.log("URL", page.url());
  console.log((await page.locator("body").innerText()).slice(0, 3200));
  await page.screenshot({
    path: ".impeccable/review/initial.png",
    fullPage: true,
  });
} finally {
  await browser.close();
}
