import { mkdir, writeFile } from "node:fs/promises";

import AxeBuilder from "@axe-core/playwright";
import { firefox, expect as baseExpect } from "@playwright/test";
const expect = baseExpect.configure({ timeout: 30000 });
const base = process.argv[2] ?? "https://crewcover-iota.vercel.app";
const folder = ".impeccable/review/enhancements";
await mkdir(folder, { recursive: true });
const browser = await firefox.launch();
const publicContext = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "light",
});
const page = await publicContext.newPage();
const report = {
  at: new Date().toISOString(),
  url: base,
  views: [],
  consoleErrors: [],
};
page.on("pageerror", (error) => report.consoleErrors.push(error.message));
try {
  for (const colorScheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.goto(base + "/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const width of [1440, 768, 390, 360]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.screenshot({
        path: `${folder}/public-${colorScheme}-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      report.views.push({
        view: `public-${colorScheme}-${width}`,
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        violations: result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
    }
  }
  const context = await browser.newContext({
    storageState: base.includes("localhost")
      ? ".tmp/auth-state.json"
      : ".tmp/production-auth-state.json",
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const workspace = await context.newPage();
  workspace.on("pageerror", (error) =>
    report.consoleErrors.push(error.message),
  );
  for (const view of ["schedule", "repairs", "activity"]) {
    await workspace.goto(`${base}/operations?view=${view}`);
    await expect(workspace.getByTestId("coverage-percentage")).toBeVisible();
    for (const width of [1440, 390]) {
      await workspace.setViewportSize({ width, height: 1000 });
      await expect
        .poll(async () =>
          workspace.evaluate(() => {
            const nav = document.querySelector(".cc-tabs"),
              tab = nav?.querySelector('[aria-current="page"]');
            if (!nav || !tab) return false;
            const n = nav.getBoundingClientRect(),
              t = tab.getBoundingClientRect();
            return t.left >= n.left - 1 && t.right <= n.right + 1;
          }),
        )
        .toBe(true);
      await workspace.screenshot({
        path: `${folder}/${view}-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
      const result = await new AxeBuilder({ page: workspace })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      report.views.push({
        view: `${view}-${width}`,
        overflow: await workspace.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        violations: result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
    }
  }
  if (process.argv.includes("--workflow-states")) {
    await workspace.setViewportSize({ width: 1440, height: 1000 });
    await workspace.goto(`${base}/operations?view=schedule`);
    await workspace
      .getByRole("button", { name: "Reset demo", exact: true })
      .click();
    await workspace
      .getByRole("alertdialog")
      .getByRole("button", { name: "Reset conference", exact: true })
      .click();
    await expect(workspace.getByTestId("coverage-percentage")).toHaveText(
      "100%",
    );
    for (const [name, role, percentage] of [
      ["Ada Okafor", "Welcome desk", "95%"],
      ["Noah Patel", "Safety & access", "90%"],
      ["Mia Chen", "Stage & technical", "85%"],
    ]) {
      await workspace
        .getByRole("button", { name: `Cancel ${name} on ${role}`, exact: true })
        .click();
      await workspace
        .getByRole("alertdialog")
        .getByRole("button", { name: "Cancel assignment", exact: true })
        .click();
      await expect(workspace.getByTestId("coverage-percentage")).toHaveText(
        percentage,
      );
    }
    await workspace
      .getByRole("button", { name: "Find a repair", exact: true })
      .click();
    await expect(
      workspace.getByRole("heading", {
        name: "3 qualified replacements",
        exact: true,
      }),
    ).toBeVisible();
    for (const width of [1440, 390]) {
      await workspace.setViewportSize({ width, height: 1000 });
      await expect
        .poll(async () =>
          workspace.evaluate(() => {
            const nav = document.querySelector(".cc-tabs"),
              tab = nav?.querySelector('[aria-current="page"]');
            if (!nav || !tab) return false;
            const n = nav.getBoundingClientRect(),
              t = tab.getBoundingClientRect();
            return t.left >= n.left - 1 && t.right <= n.right + 1;
          }),
        )
        .toBe(true);
      await workspace.screenshot({
        path: `${folder}/pending-repair-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
      const result = await new AxeBuilder({ page: workspace })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      report.views.push({
        view: `pending-repair-${width}`,
        violations: result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
    }
    await workspace.setViewportSize({ width: 1440, height: 1000 });
    await workspace
      .getByRole("navigation", { name: "Event views" })
      .getByRole("button", { name: "Schedule", exact: true })
      .click();
    await workspace
      .getByRole("textbox", { name: "Find volunteer to assign" })
      .fill("Isla Young");
    const source = workspace.getByRole("button", {
      name: "Drag Isla Young to a vacancy",
      exact: true,
    });
    const target = workspace.getByTestId("shift-s-1");
    await source.scrollIntoViewIfNeeded();
    const from = await source.boundingBox();
    if (!from) throw new Error("Drag source unavailable");
    await workspace.mouse.move(
      from.x + from.width / 2,
      from.y + from.height / 2,
    );
    await workspace.mouse.down();
    await workspace.mouse.move(
      from.x + from.width / 2 + 12,
      from.y + from.height / 2,
      { steps: 3 },
    );
    await expect(workspace.locator(".cc-drag-preview")).toBeVisible();
    await target.scrollIntoViewIfNeeded();
    const to = await target.boundingBox();
    if (!to) throw new Error("Drop target unavailable");
    await workspace.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
      steps: 15,
    });
    await workspace.screenshot({
      path: `${folder}/drag-feedback-1440.png`,
      fullPage: true,
      animations: "disabled",
    });
    await workspace.mouse.up();
    await expect(
      workspace.getByRole("alertdialog").getByRole("heading"),
    ).toHaveText("Review manual assignment");
    for (const width of [1440, 390]) {
      await workspace.setViewportSize({ width, height: 1000 });
      await expect
        .poll(async () =>
          workspace.evaluate(() => {
            const nav = document.querySelector(".cc-tabs"),
              tab = nav?.querySelector('[aria-current="page"]');
            if (!nav || !tab) return false;
            const n = nav.getBoundingClientRect(),
              t = tab.getBoundingClientRect();
            return t.left >= n.left - 1 && t.right <= n.right + 1;
          }),
        )
        .toBe(true);
      await expect(workspace.getByRole("alertdialog")).toHaveCSS(
        "opacity",
        "1",
      );
      await workspace.screenshot({
        path: `${folder}/drag-review-${width}.png`,
        fullPage: true,
        animations: "disabled",
      });
      const result = await new AxeBuilder({ page: workspace })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      report.views.push({
        view: `drag-review-${width}`,
        violations: result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
    }
    await workspace
      .getByRole("button", { name: "Keep schedule", exact: true })
      .click();
    await expect(workspace.getByTestId("coverage-percentage")).toHaveText(
      "85%",
    );
  }
  await workspace.setViewportSize({ width: 1440, height: 1000 });
  await workspace.goto(`${base}/chat`);
  await expect(
    workspace.getByRole("navigation", { name: "CrewCover agent context" }),
  ).toBeVisible();
  await expect(
    workspace.getByRole("heading", {
      name: "Your CrewCover operations assistant",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    workspace.getByRole("navigation", { name: "CrewCover agent context" }),
  ).toContainText("Gather 2026");
  await workspace.screenshot({
    path: `${folder}/chat-1440.png`,
    fullPage: true,
    animations: "disabled",
  });
  await workspace.setViewportSize({ width: 390, height: 844 });
  await workspace.screenshot({
    path: `${folder}/chat-390.png`,
    fullPage: true,
    animations: "disabled",
  });
  const result = await new AxeBuilder({ page: workspace })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  report.views.push({
    view: "chat-390",
    violations: result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
} finally {
  await writeFile(
    folder + "/accessibility.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      {
        views: report.views.map((v) => ({
          view: v.view,
          overflow: v.overflow,
          violations: v.violations.map((x) => x.id),
        })),
        consoleErrors: report.consoleErrors,
      },
      null,
      2,
    ),
  );
  await browser.close();
}
if (
  report.views.some((v) => v.overflow || v.violations.length) ||
  report.consoleErrors.length
)
  process.exitCode = 1;
