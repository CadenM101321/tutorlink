import { defineConfig } from "@playwright/test";

const PORT = 3100;

// End-to-end tests: a real browser clicks through the app like a person would.
// Runs against a production build (`npm run build` first) using the installed
// Microsoft Edge, so no extra browser download is needed.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "msedge",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
