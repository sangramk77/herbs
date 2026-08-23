import path from 'path';

import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        chunkSizeWarningLimit: 1700,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return undefined;
                    }

                    // Keep only large, mostly self-contained libraries split out.
                    if (
                        id.includes('leaflet') ||
                        id.includes('leaflet-draw') ||
                        id.includes('leaflet.markercluster') ||
                        id.includes('react-leaflet')
                    ) {
                        return 'leaflet';
                    }

                    if (
                        id.includes('yet-another-react-lightbox') ||
                        id.includes('embla-carousel')
                    ) {
                        return 'media';
                    }

                    if (
                        id.includes('@tiptap/') ||
                        id.includes('prosemirror') ||
                        id.includes('react-simplemde-editor') ||
                        id.includes('easymde')
                    ) {
                        return 'editor';
                    }

                    return undefined;
                },
            },
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
});
