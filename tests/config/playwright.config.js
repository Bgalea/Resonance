import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: '../e2e',
    fullyParallel: false, // Disable full parallelism to reduce resource usage
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1, // Add retry for flaky tests
    workers: 1, // Run tests sequentially to avoid resource exhaustion
    timeout: 60000, // Increase global timeout from 30s to 60s
    reporter: [['html', { outputFolder: '../reports/playwright' }]],
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        navigationTimeout: 30000, // Explicit navigation timeout
        actionTimeout: 10000, // Timeout for actions like click
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
    ],
    webServer: {
        command: 'npx serve -l 3000',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        cwd: '../../',
    },
});
