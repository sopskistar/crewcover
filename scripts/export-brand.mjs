import { readFile, writeFile } from "node:fs/promises";

import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
const svg = await readFile("public/og.svg", "utf8");
const font = await readFile(
  "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
);
await page.setContent(
  `<style>body{margin:0}@font-face{font-family:CrewCoverInter;src:url(data:font/woff2;base64,${font.toString("base64")})}</style>${svg.replaceAll("Arial,sans-serif", "CrewCoverInter,sans-serif")}`,
);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/og.png" });
await writeFile(
  "public/og.png.json",
  JSON.stringify(
    {
      origin: "Original CrewCover vector artwork rendered with Playwright",
      source: "public/og.svg",
      script: "scripts/export-brand.mjs",
      font: "Inter Variable, SIL OFL 1.1",
    },
    null,
    2,
  ) + "\n",
);
await browser.close();
console.log("Exported original 1200×630 social image.");
