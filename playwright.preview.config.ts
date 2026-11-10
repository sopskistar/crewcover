import { defineConfig } from "@playwright/test";

import config from "./playwright.firefox.config";
export default defineConfig({
  ...config,
  use: {
    ...config.use,
    baseURL: "http://localhost:8091",
    storageState: ".tmp/auth-state.json",
  },
});
