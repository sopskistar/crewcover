import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";

async function reset(page: Page) {
  await page.goto("/operations?view=schedule");
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Reset conference", exact: true })
    .click();
  await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
}
export async function dragVolunteer(page: Page, name: string, shiftId: string) {
  await page
    .getByRole("textbox", { name: "Find volunteer to assign" })
    .fill(name);
  const source = page.getByRole("button", {
    name: `Drag ${name} to a vacancy`,
    exact: true,
  });
  const target = page.getByTestId(`shift-${shiftId}`);
  await target.scrollIntoViewIfNeeded();
  await source.scrollIntoViewIfNeeded();
  const from = await source.boundingBox(),
    to = await target.boundingBox();
  if (!from || !to) throw new Error("Drag endpoints are not visible");
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    from.x + from.width / 2 + 12,
    from.y + from.height / 2,
    { steps: 3 },
  );
  await expect(page.locator(".cc-drag-preview")).toBeVisible();
  const destination = await target.boundingBox();
  if (!destination) throw new Error("Drop target not visible");
  await page.mouse.move(
    destination.x + destination.width / 2,
    destination.y + destination.height / 2,
    {
      steps: 15,
    },
  );
  await expect(target).toHaveClass(/cc-drop-over/);
  await page.mouse.up();
}

test("public introduction is accessible, responsive, read-only and keeps operations protected", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
  });
  const page = await context.newPage();
  const operations: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/_agent-native/actions/")) operations.push(r.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "When your crew changes, your plan doesn’t have to.",
  );
  await expect(
    page.getByText("Fictional preview", { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/CrewCover/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://crewcover-iota.vercel.app/og.png",
  );
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    for (const width of [1440, 768, 390, 360]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
    }
    const a11y = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(a11y.violations).toEqual([]);
  }
  expect(operations).toHaveLength(0);
  await page
    .getByRole("link", { name: "Get started", exact: false })
    .filter({ visible: true })
    .first()
    .click();
  await expect(page.locator("#login-form")).toBeVisible();
  const denied = await context.request.get(
    "/_agent-native/actions/list-events",
  );
  expect(denied.status()).toBe(401);
  await context.close();
});

test("drag rejects invalid drops, reviews eligible fills and persists only after approval", async ({
  page,
}) => {
  await reset(page);
  await page
    .getByRole("button", {
      name: "Cancel Ada Okafor on Welcome desk",
      exact: true,
    })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Cancel assignment", exact: true })
    .click();
  await expect(page.getByTestId("coverage-percentage")).toHaveText("95%");
  for (const [name, reason] of [
    ["Ada Okafor", "cancelled"],
    ["Noah Patel", "Missing Registration"],
    ["Eli Brooks", "Overlapping assignment"],
    ["Ezra Morgan", "Not available"],
  ]) {
    await dragVolunteer(page, name!, "s-1");
    await expect(page.locator(".cc-drag-feedback")).toContainText(reason!);
    await expect(page.getByRole("alertdialog")).not.toBeVisible();
    await expect(page.getByTestId("coverage-percentage")).toHaveText("95%");
  }
  await dragVolunteer(page, "Isla Young", "s-6");
  await expect(page.locator(".cc-drag-feedback")).toContainText(
    "fully covered",
  );
  await dragVolunteer(page, "Isla Young", "s-1");
  await expect(page.getByRole("alertdialog").getByRole("heading")).toHaveText(
    "Review manual assignment",
  );
  await expect(page.getByTestId("coverage-percentage")).toHaveText("95%");
  await page
    .getByRole("button", { name: "Keep schedule", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Drag Isla Young to a vacancy",
      exact: true,
    }),
  ).toBeFocused();
  await expect(page.getByTestId("coverage-percentage")).toHaveText("95%");
  await dragVolunteer(page, "Isla Young", "s-1");
  await page
    .getByRole("button", { name: "Approve assignment", exact: true })
    .click();
  await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
  await page.reload();
  await expect(page.getByTestId("shift-s-1")).toContainText("Isla Young");
  await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
  await page
    .getByRole("button", { name: "Ask agent", exact: true })
    .first()
    .click();
  await page
    .locator("[contenteditable=true][role=textbox]:visible")
    .first()
    .waitFor();
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
  await dragVolunteer(page, "Sofia Park", "s-4");
  await expect(page.getByRole("alertdialog").getByRole("heading")).toHaveText(
    "Review manual assignment",
  );
  await page
    .getByRole("button", { name: "Approve assignment", exact: true })
    .click();
  await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
  await page.reload();
  await expect(page.getByTestId("shift-s-4")).toContainText("Sofia Park");
  const a11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(a11y.violations).toEqual([]);
});

test.describe("touch fallback", () => {
  test.use({ hasTouch: true });
  test("phone manual fallback and keyboard cancellation preserve accessible scheduling", async ({
    page,
  }) => {
    await reset(page);
    const handle = page.getByRole("button", {
      name: "Drag Ada Okafor to a vacancy",
      exact: true,
    });
    await handle.focus();
    await page.keyboard.press("Space");
    await expect(page.locator(".cc-drag-preview")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".cc-drag-preview")).not.toBeVisible();
    await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page
      .getByRole("button", {
        name: "Cancel Ada Okafor on Welcome desk",
        exact: true,
      })
      .tap();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Cancel assignment", exact: true })
      .tap();
    const vacancy = page
      .getByTestId("shift-s-1")
      .getByRole("button", { name: /1 uncovered/ });
    await vacancy.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog").getByRole("heading")).toHaveText(
      "Assign a replacement",
    );
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Assign", exact: true })
      .first()
      .tap();
    await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
    const nav = page.getByRole("navigation", { name: "Event views" });
    const activity = nav.getByRole("button", { name: "Activity", exact: true });
    await activity.tap();
    const visibleTab = await activity.boundingBox();
    const navBox = await nav.boundingBox();
    expect(
      visibleTab &&
        navBox &&
        visibleTab.x >= navBox.x &&
        visibleTab.x + visibleTab.width <= navBox.x + navBox.width + 1,
    ).toBe(true);
    for (const width of [1440, 360, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await expect
        .poll(async () => {
          const t = await activity.boundingBox(),
            n = await nav.boundingBox();
          return !!(
            t &&
            n &&
            t.x >= n.x - 1 &&
            t.x + t.width <= n.x + n.width + 1
          );
        })
        .toBe(true);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  });
});

test("specialized agent context and navigation return to the real operations workspace", async ({
  page,
}) => {
  await page.goto("/operations");
  await expect(page.getByTestId("coverage-percentage")).toBeVisible();
  const eventId = new URL(page.url()).searchParams.get("eventId");
  expect(eventId).toBeTruthy();
  await page.goto(`/chat?eventId=${encodeURIComponent(eventId!)}`);
  const context = page.getByRole("navigation", {
    name: "CrewCover agent context",
  });
  await expect(context).toContainText("Gather 2026");
  await expect(
    page.getByRole("heading", {
      name: "Your CrewCover operations assistant",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "What staffing gaps need attention?",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`eventId=${eventId}`));
  await expect(
    context.getByRole("link", { name: "Repair Center", exact: true }),
  ).toHaveAttribute("href", `/operations?view=repairs&eventId=${eventId}`);
  await context
    .getByRole("link", { name: "Repair Center", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Repair Center", exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("coverage-percentage")).toBeVisible();
});
