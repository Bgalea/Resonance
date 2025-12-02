import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        globals: true,
        include: ['tests/unit/**/*.test.js'],
        exclude: ['tests/e2e/**/*'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: 'tests/reports/coverage',
            include: ['js/**/*.js'],
            exclude: [
                'js/generatedConfig.js',
                'js/browserCompatibility.js',
                'js/config.js',
                'js/main.js',
                'js/audioLoader.js',
                'js/audioUtils.js',
                'js/fullscreen.js',
                'js/touchControls.js',
                'js/loadingStateManager.js',
                'js/transitionManager.js'
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80
            }
        },
        setupFiles: ['tests/setup.js']
    }
});
