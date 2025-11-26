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
            include: ['js/**/*.js'],
            exclude: [
                'js/generatedConfig.js',
                'js/browserCompatibility.js',
                'js/config.js'
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80
            }
        },
        setupFiles: ['./tests/setup.js']
    }
});
