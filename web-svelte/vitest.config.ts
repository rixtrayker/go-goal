import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST, compilerOptions: { runes: true } })],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    reporters: ['verbose'],
  },
  resolve: {
    alias: {
      $lib: '/src/lib',
      $app: '/src/app',
    },
  },
});