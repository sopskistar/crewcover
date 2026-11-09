import { mkdir, writeFile } from "node:fs/promises";

import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox, expect as baseExpect } from "@playwright/test";
const expect = baseExpect.configure({ timeout: 30000 });

await mkdir(".impeccable/review", { recursive: true });
const browser = await (
  process.argv.includes("--firefox") ? firefox : chromium
).launch();
const context = await browser.newContext({
  storageState: ".tmp/production-auth-state.json",
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const report = {
  at: new Date().toISOString(),
  url: "https://crewcover-iota.vercel.app",
  views: [],
  consoleErrors: [],
};
page.on("pageerror", (error) => report.consoleErrors.push(error.message));
try {
  if (process.argv.includes("--prepare-gaps")) {
    await page.goto("https://crewcover-iota.vercel.app/operations");
    await expect(
      page.getByRole("heading", { name: "Gather 2026", exact: true }),
    ).toBeVisible({ timeout: 60000 });
    await page.getByRole("button", { name: "Reset demo", exact: true }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Reset conference", exact: true })
      .click();
    await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
    for (const [name, role, percentage] of [
      ["Ada Okafor", "Welcome desk", "95%"],
      ["Noah Patel", "Safety & access", "90%"],
      ["Mia Chen", "Stage & technical", "85%"],
    ]) {
      await page
        .getByRole("button", { name: `Cancel ${name} on ${role}`, exact: true })
        .click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Cancel assignment", exact: true })
        .click();
      await expect(page.getByTestId("coverage-percentage")).toHaveText(
        percentage,
      );
    }
    await page
      .getByRole("button", { name: "Find a repair", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "3 qualified replacements",
        exact: true,
      }),
    ).toBeVisible();
  }
  for (const view of [
    "overview",
    "schedule",
    "volunteers",
    "repairs",
    "activity",
  ]) {
    await page.goto(
      `https://crewcover-iota.vercel.app/operations?view=${view}`,
    );
    await expect(
      page.getByRole("heading", { name: "Gather 2026", exact: true }),
    ).toBeVisible({ timeout: 60000 });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    report.views.push({
      view,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
    await page.screenshot({
      path: `.impeccable/review/${view}-desktop.png`,
      fullPage: true,
    });
  }
  await page.goto("https://crewcover-iota.vercel.app/operations?view=overview");
  await expect(page.getByTestId("coverage-percentage")).toBeVisible();
  await page.screenshot({
    path: ".impeccable/review/desktop.png",
    fullPage: true,
  });
  for (const width of [1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(
      page.getByRole("heading", { name: "Gather 2026", exact: true }),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    if (overflow) throw new Error(`Horizontal overflow at ${width}`);
    await expect(page.locator(".cc-coverage-action button")).toBeVisible();
    await page.screenshot({
      path: `.impeccable/review/${width === 390 ? "mobile" : `user-${width}`}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => (document.documentElement.style.zoom = "2"));
  report.cssZoom200NoDocumentOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth + 1,
  );
  await page.screenshot({
    path: ".impeccable/review/zoom-200.png",
    fullPage: true,
  });
  await page.evaluate(() => (document.documentElement.style.zoom = "1"));
  await page
    .getByRole("button", { name: "Ask agent", exact: true })
    .first()
    .click();
  await page
    .locator("[contenteditable=true][role=textbox]:visible")
    .first()
    .waitFor({ timeout: 60000 });
  const agentAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  report.views.push({
    view: "agent-panel",
    violations: agentAxe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
  await page.screenshot({
    path: ".impeccable/review/agent-panel.png",
    fullPage: true,
  });
  await page.keyboard.press("Tab");
  report.keyboardFocusVisible = await page.evaluate(() => {
    const el = document.activeElement;
    return !!el && el.matches(":focus-visible");
  });
  report.reducedMotion = await page
    .getByTestId("coverage-percentage")
    .evaluate((el) => getComputedStyle(el).animationName === "none");
} finally {
  await writeFile(
    ".impeccable/review/accessibility.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        views: report.views.map((v) => ({
          view: v.view,
          violations: v.violations.map((x) => x.id),
        })),
        consoleErrors: report.consoleErrors,
        keyboardFocusVisible: report.keyboardFocusVisible,
        reducedMotion: report.reducedMotion,
      },
      null,
      2,
    ),
  );
  await browser.close();
}
