import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const context = await browser.newContext({
  storageState: ".tmp/production-auth-state.json",
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
await page.goto("https://crewcover-iota.vercel.app/operations");
await page.getByRole("heading", { name: "Gather 2026", exact: true }).waitFor();
console.log(
  "Sidebar styles:",
  await page
    .locator("aside")
    .evaluateAll((nodes) =>
      nodes.map((n) => ({
        class: n.className,
        background: getComputedStyle(n).backgroundColor,
        color: getComputedStyle(n).color,
        parent: n.parentElement?.className,
      })),
    ),
);
await page
  .getByRole("button", { name: "Ask agent", exact: true })
  .first()
  .click();
await page
  .locator("textarea:visible,[contenteditable=true]:visible")
  .first()
  .waitFor({ timeout: 45000 })
  .catch(() => {});
console.log(
  "Visible text inputs:",
  await page
    .locator("textarea,[contenteditable=true]")
    .evaluateAll((nodes) =>
      nodes.map((n) => ({
        tag: n.tagName,
        role: n.getAttribute("role"),
        placeholder: n.getAttribute("placeholder"),
        "data-placeholder": n.getAttribute("data-placeholder"),
        class: n.className,
      })),
    ),
);
console.log(
  "Visible page tail:",
  (await page.locator("body").innerText()).slice(-1800),
);
await page.screenshot({
  path: ".impeccable/review/agent-panel-initial.png",
  fullPage: true,
});
await browser.close();
