import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const context = await browser.newContext(
  process.argv.includes("--authenticated")
    ? { storageState: ".tmp/production-auth-state.json" }
    : {},
);
const page = await context.newPage();
const pending = new Set();
page.on("request", (r) => pending.add(r.url()));
page.on("requestfinished", (r) => pending.delete(r.url()));
page.on("requestfailed", (r) => {
  pending.delete(r.url());
  console.log(
    "Request failure",
    new URL(r.url()).pathname,
    r.failure()?.errorText,
  );
});
page.on("console", (m) => {
  if (["warning", "error"].includes(m.type()))
    console.log(m.type(), m.text().slice(0, 400));
});
page.on("pageerror", (e) => console.log("Page error", e.message));
await page.goto((process.argv[2] ?? "http://localhost:8080") + "/operations", {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
await page.waitForTimeout(20000);
console.log(
  "Pending paths",
  [...pending].map((u) => new URL(u).pathname).slice(0, 30),
);
console.log(
  "Script URLs",
  await page
    .locator("script[src]")
    .evaluateAll((x) => x.map((s) => s.getAttribute("src"))),
);
console.log("Text", (await page.locator("body").innerText()).slice(0, 1600));
await browser.close();
