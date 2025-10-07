<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  onMount(() => {
    goto('/dashboard');
  });
</script>

<svelte:head>
  <title>Go Goal - Personal Productivity System</title>
</svelte:head>

<div class="home-page">
  <div class="loading">
    <h1>Go Goal</h1>
    <p>Loading your productivity dashboard...</p>
  </div>
</div>

<style>
  .home-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
  }

  .loading {
    text-align: center;
    color: white;
  }

  .loading h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .loading p {
    font-size: 1.125rem;
    opacity: 0.8;
  }
</style>