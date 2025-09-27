import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	
	server: {
		port: 3000,
		proxy: {
			// Proxy API calls to Go backend
			'/api': {
				target: 'http://localhost:8080',
				changeOrigin: true
			},
			'/graphql': {
				target: 'http://localhost:8080',
				changeOrigin: true
			}
		}
	},
	
	// Build configuration
	build: {
		target: 'es2020',
		sourcemap: true
	},
	
	// Development configuration
	define: {
		'process.env.NODE_ENV': '"development"'
	}
});
