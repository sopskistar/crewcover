import { defineConfig } from "@playwright/test";

import config from "./playwright.config";
export default defineConfig({
  ...config,
  use: {
    ...config.use,
    baseURL: "https://crewcover-iota.vercel.app",
    storageState: ".tmp/production-auth-state.json",
  },
});
