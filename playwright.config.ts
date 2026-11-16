import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'pruebas',
  fullyParallel: false,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4477',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'python3 -m http.server 4477 --bind 127.0.0.1 --directory dist',
    url: 'http://127.0.0.1:4477',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
