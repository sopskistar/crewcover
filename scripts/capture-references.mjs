import { mkdir } from "node:fs/promises";

import { chromium } from "@playwright/test";
await mkdir(".impeccable/review/references", { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const [name, url] of [
  ["21st", "https://21st.dev/community/components"],
  ["magicui", "https://magicui.design/docs/components/animated-list"],
  ["60fps", "https://60fps.design/"],
]) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1800);
    await page.screenshot({
      path: `.impeccable/review/references/${name}.png`,
    });
    console.log(name + " reference captured");
  } catch (error) {
    console.log(name + " capture failed: " + error.name);
  }
  await page.close();
}
await browser.close();
