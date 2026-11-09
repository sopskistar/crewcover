import { defineConfig } from "@playwright/test";

import config from "./playwright.production.config";

export default defineConfig({
  ...config,
  use: { ...config.use, browserName: "firefox" },
});
