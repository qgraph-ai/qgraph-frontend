import { defineConfig, devices } from "@playwright/test"

const PORT = 3000
const BASE_URL = `http://127.0.0.1:${PORT}`
const IS_CI = !!process.env.CI

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },

  reporter: IS_CI ? [["github"], ["html", { open: "never" }]] : "html",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !IS_CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
})
