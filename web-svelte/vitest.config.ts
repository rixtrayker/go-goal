import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [
    svelte({ 
      hot: !process.env.VITEST, 
      compilerOptions: { 
        runes: true,
        generate: 'dom' // Ensure client-side generation for tests
      } 
    })
  ],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    reporters: ['verbose'],
    server: {
      deps: {
        inline: ['@testing-library/svelte']
      }
    }
  },
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
      '$app/navigation': path.resolve('./src/test/mocks/$app/navigation.ts'),
      '$app/stores': path.resolve('./src/test/mocks/$app/stores.ts'),
      '$app/environment': path.resolve('./src/test/mocks/$app/environment.ts'),
    },
  },
});