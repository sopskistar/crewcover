import { writeFile } from "node:fs/promises";

import { firefox, expect as baseExpect } from "@playwright/test";
const expect = baseExpect.configure({ timeout: 30000 });
const base = "https://crewcover-iota.vercel.app";
const browser = await firefox.launch();
try {
  const context = await browser.newContext({
    storageState: ".tmp/production-auth-state.json",
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(base + "/operations");
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Reset conference", exact: true })
    .click();
  const toast = page
    .locator('[data-sonner-toast][data-type="success"]')
    .filter({ hasText: "Demo reset to full coverage." });
  await expect(toast).toBeVisible();
  const rendered = await toast.evaluate((el) => ({
    foreground: getComputedStyle(el.querySelector("[data-title]") ?? el).color,
    background: getComputedStyle(el).backgroundColor,
  }));
  const luminance = (color) => {
    const values = color
      .match(/[\d.]+/g)
      ?.slice(0, 3)
      .map(Number);
    if (!values || values.length !== 3)
      throw new Error("Unsupported computed color");
    const [r, g, b] = values.map((v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = luminance(rendered.foreground),
    b = luminance(rendered.background);
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  if (ratio < 4.5)
    throw new Error(
      `Success feedback contrast ${ratio.toFixed(2)} is below 4.5:1`,
    );
  await page.screenshot({
    path: ".impeccable/review/enhancements/toast-contrast-1440.png",
    fullPage: true,
    animations: "disabled",
  });
  await expect(page.getByTestId("coverage-percentage")).toHaveText("100%");
  const evidence = {
    at: new Date().toISOString(),
    url: base,
    operation: "Actual owner-scoped fictional demo reset",
    ...rendered,
    contrastRatio: Number(ratio.toFixed(2)),
    minimum: 4.5,
    coverage: 100,
  };
  await writeFile(
    "docs/evidence/feedback-contrast.json",
    JSON.stringify(evidence, null, 2) + "\n",
  );
  console.log(JSON.stringify(evidence));
} finally {
  await browser.close();
}
