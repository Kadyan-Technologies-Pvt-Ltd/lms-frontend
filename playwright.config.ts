import { defineConfig, devices } from '@playwright/test'

// Runs against the already-running dev servers (localhost:5173 -> proxies
// /api to localhost:8000) rather than spawning its own — this project's dev
// workflow keeps both servers up persistently, and these tests are meant to
// be run against that live instance, not a throwaway build.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  // This suite does ~8 real logins across its files (auth.spec.ts tests the
  // login form itself; everything else needs a real session). apps/accounts
  // rate-limits login at 10/min/IP — a real, deliberate security control we
  // don't want to weaken for test convenience — so a run where those 8
  // cluster tightly enough can occasionally graze it. One retry absorbs
  // that timing collision without masking anything: a genuine app bug fails
  // the same way on retry, a rate-limit graze doesn't.
  retries: 2,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
