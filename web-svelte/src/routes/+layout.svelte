<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/navigation/Navigation.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
	<Navigation />
	<main class="main-content">
		{@render children?.()}
	</main>
</div>

<style>
	.app {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.main-content {
		min-height: calc(100vh - 80px);
	}
</style>
