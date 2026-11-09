import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 120000,
  workers: 1,
  forbidOnly: true,
  expect: { timeout: 30000 },
  use: {
    baseURL: "http://localhost:8080",
    storageState: ".tmp/auth-state.json",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
