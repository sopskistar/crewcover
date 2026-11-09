import { test, expect } from "@playwright/test";

test("real cancellation → proposal → approval → persisted recovery → manual assignment", async ({
  page,
}) => {
  const operations: string[] = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/_agent-native/actions/"))
      operations.push(path.split("/").pop()!);
  });
  await page.goto("/operations");
  await expect(
    page.getByRole("heading", { name: "Gather 2026", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Reset conference", exact: true })
    .click();
  await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
  const cancelTrigger = page.getByRole("button", {
    name: "Cancel Ada Okafor on Welcome desk",
    exact: true,
  });
  await cancelTrigger.focus();
  await page.keyboard.press("Enter");
  await expect(
    page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Keep assignment", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(cancelTrigger).toBeFocused();
  for (const [name, role, percent] of [
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
    await expect(page.getByTestId("coverage-percentage")).toHaveText(percent!);
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
  await expect(page.getByTestId("coverage-percentage")).toHaveText("85%");
  await page
    .getByRole("button", { name: "Review & approve", exact: true })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Approve & apply repair", exact: true })
    .click();
  await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
  await page.reload();
  await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
  const nav = page.getByRole("navigation", { name: "Event views" });
  await nav.getByRole("button", { name: "Activity", exact: true }).click();
  await expect(
    page.getByText("Repair approved. Coverage is 100%.", { exact: true }),
  ).toBeVisible();
  await nav.getByRole("button", { name: "Schedule", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Cancel Leo Mensah on Guest assistance",
      exact: true,
    })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Cancel assignment", exact: true })
    .click();
  await expect(page.getByTestId("coverage-percentage")).toHaveText("95%");
  await page
    .getByTestId("shift-s-4")
    .getByRole("button", { name: /1 uncovered/ })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Assign", exact: true })
    .first()
    .click();
  await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
  for (const name of [
    "get-event-coverage",
    "cancel-assignment",
    "generate-repair-proposal",
    "approve-repair-proposal",
    "find-qualified-replacements",
    "assign-volunteer",
  ])
    expect(operations).toContain(name);
});

test("responsive workspace remains usable at tablet and phone widths", async ({
  page,
}) => {
  await page.goto("/operations");
  await expect(
    page.getByRole("heading", { name: "Gather 2026", exact: true }),
  ).toBeVisible();
  for (const width of [1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(
      page.getByRole("heading", { name: "Gather 2026", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
    await page
      .getByRole("navigation", { name: "Event views" })
      .getByRole("button", { name: "Volunteers", exact: true })
      .click();
    await page.getByRole("textbox", { name: "Search volunteers" }).fill("Ada");
    await expect(
      page.getByRole("rowheader", { name: /Ada Okafor/ }),
    ).toBeVisible();
    await page
      .getByRole("textbox", { name: "Search volunteers" })
      .fill("No matching crew");
    await expect(
      page.getByText("No volunteers match these filters."),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Clear filters", exact: true })
      .click();
    await page
      .getByRole("navigation", { name: "Event views" })
      .getByRole("button", { name: "Overview", exact: true })
      .click();
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .getByTestId("coverage-percentage")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});

test("volunteer profile creation and editing persist through refresh", async ({
  page,
}) => {
  await page.goto("/operations?view=volunteers");
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Reset conference", exact: true })
    .click();
  await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
  await page
    .getByRole("button", { name: "Add volunteer", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Robin Demo");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save volunteer", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search volunteers" })
    .fill("Robin Demo");
  await expect(
    page.getByRole("rowheader", { name: /Robin Demo/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Robin Demo", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("spinbutton", { name: "Working-hour limit" })
    .fill("6");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save volunteer", exact: true })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.reload();
  await page
    .getByRole("textbox", { name: "Search volunteers" })
    .fill("Robin Demo");
  await expect(
    page
      .getByRole("row")
      .filter({ has: page.getByRole("rowheader", { name: /Robin Demo/ }) }),
  ).toContainText("0 / 6 h");
});
