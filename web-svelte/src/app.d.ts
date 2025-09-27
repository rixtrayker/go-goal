// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	readonly VITE_GRAPHQL_URL: string;
	readonly VITE_DEV_MODE: string;
	readonly VITE_APP_TITLE: string;
	readonly VITE_APP_DESCRIPTION: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
