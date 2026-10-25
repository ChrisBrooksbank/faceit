import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        sveltekit(),
        SvelteKitPWA({
            registerType: 'prompt',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,json,woff2,webp}'],
            },
            manifest: {
                name: 'FaceIt - Face Recognition Training',
                short_name: 'FaceIt',
                description:
                    'A Progressive Web App to help people with prosopagnosia improve face recognition through perceptual discrimination training',
                theme_color: '#2563eb',
                background_color: '#f5f5f5',
                id: '/',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    {
                        src: '/icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                    {
                        src: '/icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
        }),
    ],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/lib/test-setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            exclude: [
                'node_modules/',
                'build/',
                '.svelte-kit/',
                '**/*.test.ts',
                '**/*.spec.ts',
                'src/routes/',
            ],
            thresholds: {
                statements: 80,
                branches: 80,
                functions: 80,
                lines: 80,
            },
        },
    },
});
