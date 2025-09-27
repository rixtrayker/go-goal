import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Configure adapter-static to build for static site generation
		// Output to ../web directory to integrate with Go server
		adapter: adapter({
			pages: '../web',
			assets: '../web',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		
		// Configure TypeScript support
		typescript: {
			config: (config) => {
				return {
					...config,
					compilerOptions: {
						...config.compilerOptions,
						strict: true
					}
				};
			}
		}
	}
};

export default config;
