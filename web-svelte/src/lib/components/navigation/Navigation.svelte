<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { User } from '$lib/types/models';

  // Props
  let {
    user = null,
    notification_count = 0
  }: {
    user?: User | null;
    notification_count?: number;
  } = $props();

  // Local state
  let is_mobile_menu_open = $state(false);

  // Navigation items
  const nav_items = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/tasks', label: 'Tasks', icon: '✅' },
    { path: '/tags', label: 'Tags', icon: '🏷️' },
  ];

  // Computed
  let current_path = $derived($page.url.pathname);

  function navigate_to(path: string) {
    goto(path);
    is_mobile_menu_open = false;
  }

  function toggle_mobile_menu() {
    is_mobile_menu_open = !is_mobile_menu_open;
  }

  function handle_navigation_keydown(event: KeyboardEvent, index: number) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next_index = (index + 1) % nav_items.length;
      const next_element = document.querySelector(`[data-nav-index="${next_index}"]`) as HTMLElement;
      next_element?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev_index = index === 0 ? nav_items.length - 1 : index - 1;
      const prev_element = document.querySelector(`[data-nav-index="${prev_index}"]`) as HTMLElement;
      prev_element?.focus();
    }
  }

  // Close mobile menu when route changes
  $effect(() => {
    if (current_path) {
      is_mobile_menu_open = false;
    }
  });
</script>

<nav class="navigation" role="navigation" aria-label="Main navigation">
  <!-- Desktop Navigation -->
  <div class="nav-desktop">
    <!-- Logo/Brand -->
    <div class="nav-brand">
      <button
        type="button"
        class="brand-button"
        onclick={() => navigate_to('/dashboard')}
      >
        <span class="brand-icon">🎯</span>
        <span class="brand-text">Go Goal</span>
      </button>
    </div>

    <!-- Navigation Links -->
    <div class="nav-links">
      {#each nav_items as item, index}
        <button
          type="button"
          class="nav-link"
          class:active={current_path === item.path}
          onclick={() => navigate_to(item.path)}
          onkeydown={(e) => handle_navigation_keydown(e, index)}
          data-nav-index={index}
        >
          <span class="nav-icon">{item.icon}</span>
          <span class="nav-text">{item.label}</span>
        </button>
      {/each}
    </div>

    <!-- User Menu -->
    <div class="nav-user">
      {#if user}
        <div class="user-menu">
          <button type="button" class="user-button">
            <span class="user-avatar">
              {user.avatar_url ? 
                `<img src="${user.avatar_url}" alt="${user.name}" />` : 
                user.name.charAt(0).toUpperCase()
              }
            </span>
            <span class="user-name">{user.name}</span>
          </button>
        </div>
      {:else}
        <button type="button" class="login-button" onclick={() => navigate_to('/login')}>
          Login
        </button>
      {/if}

      <!-- Notifications -->
      {#if notification_count > 0}
        <button type="button" class="notifications-button">
          <span class="notification-icon">🔔</span>
          <span class="notification-badge">{notification_count}</span>
        </button>
      {/if}
    </div>
  </div>

  <!-- Mobile Navigation -->
  <div class="nav-mobile">
    <!-- Mobile Header -->
    <div class="mobile-header">
      <button
        type="button"
        class="brand-button"
        onclick={() => navigate_to('/dashboard')}
      >
        <span class="brand-icon">🎯</span>
        <span class="brand-text">Go Goal</span>
      </button>

      <button
        type="button"
        class="mobile-menu-toggle"
        onclick={toggle_mobile_menu}
        aria-label="Toggle menu"
        aria-expanded={is_mobile_menu_open}
      >
        <span class="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div 
      class="mobile-menu" 
      class:open={is_mobile_menu_open}
      data-testid="mobile-menu"
    >
      <div class="mobile-nav-links">
        {#each nav_items as item}
          <button
            type="button"
            class="mobile-nav-link"
            class:active={current_path === item.path}
            onclick={() => navigate_to(item.path)}
          >
            <span class="nav-icon">{item.icon}</span>
            <span class="nav-text">{item.label}</span>
          </button>
        {/each}
      </div>

      <div class="mobile-user-section">
        {#if user}
          <div class="mobile-user-info">
            <span class="user-avatar">
              {user.avatar_url ? 
                `<img src="${user.avatar_url}" alt="${user.name}" />` : 
                user.name.charAt(0).toUpperCase()
              }
            </span>
            <span class="user-name">{user.name}</span>
          </div>
        {:else}
          <button type="button" class="mobile-login-button" onclick={() => navigate_to('/login')}>
            Login
          </button>
        {/if}
      </div>
    </div>
  </div>
</nav>

<style>
  .navigation {
    position: sticky;
    top: 0;
    z-index: 40;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(229, 231, 235, 0.8);
  }

  /* Desktop Navigation */
  .nav-desktop {
    display: none;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
  }

  @media (min-width: 768px) {
    .nav-desktop {
      display: flex;
    }
  }

  .nav-brand {
    flex-shrink: 0;
  }

  .brand-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border: none;
    border-radius: 0.5rem;
    background: transparent;
    color: rgb(17, 24, 39);
    font-weight: 600;
    font-size: 1.125rem;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .brand-button:hover {
    background: rgba(59, 130, 246, 0.1);
    color: rgb(59, 130, 246);
  }

  .brand-icon {
    font-size: 1.5rem;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex: 1;
    justify-content: center;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 0.5rem;
    background: transparent;
    color: rgb(107, 114, 128);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    white-space: nowrap;
  }

  .nav-link:hover {
    background: rgba(107, 114, 128, 0.1);
    color: rgb(55, 65, 81);
  }

  .nav-link:focus {
    outline: 2px solid rgba(59, 130, 246, 0.5);
    outline-offset: 2px;
  }

  .nav-link.active {
    background: rgba(59, 130, 246, 0.1);
    color: rgb(59, 130, 246);
    font-weight: 600;
  }

  .nav-icon {
    font-size: 1.125rem;
  }

  .nav-user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .user-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border: none;
    border-radius: 0.5rem;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .user-button:hover {
    background: rgba(107, 114, 128, 0.1);
  }

  .user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.1);
    color: rgb(59, 130, 246);
    font-weight: 600;
    font-size: 0.875rem;
    overflow: hidden;
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-name {
    font-weight: 500;
    color: rgb(55, 65, 81);
  }

  .login-button {
    padding: 0.5rem 1rem;
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 0.5rem;
    background: rgba(59, 130, 246, 0.1);
    color: rgb(59, 130, 246);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .login-button:hover {
    background: rgba(59, 130, 246, 0.2);
  }

  .notifications-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border: none;
    border-radius: 0.5rem;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .notifications-button:hover {
    background: rgba(107, 114, 128, 0.1);
  }

  .notification-icon {
    font-size: 1.25rem;
  }

  .notification-badge {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.25rem;
    border-radius: 0.625rem;
    background: rgb(239, 68, 68);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1;
  }

  /* Mobile Navigation */
  .nav-mobile {
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    .nav-mobile {
      display: none;
    }
  }

  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
  }

  .mobile-menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border: none;
    border-radius: 0.5rem;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .mobile-menu-toggle:hover {
    background: rgba(107, 114, 128, 0.1);
  }

  .hamburger {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .hamburger span {
    width: 1.25rem;
    height: 0.125rem;
    background: rgb(107, 114, 128);
    border-radius: 0.0625rem;
    transition: all 0.3s ease;
  }

  .mobile-menu {
    display: none;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(229, 231, 235, 0.8);
  }

  .mobile-menu.open {
    display: flex;
  }

  .mobile-nav-links {
    display: flex;
    flex-direction: column;
    padding: 1rem 1.5rem;
    gap: 0.5rem;
  }

  .mobile-nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: none;
    border-radius: 0.5rem;
    background: transparent;
    color: rgb(107, 114, 128);
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .mobile-nav-link:hover {
    background: rgba(107, 114, 128, 0.1);
    color: rgb(55, 65, 81);
  }

  .mobile-nav-link.active {
    background: rgba(59, 130, 246, 0.1);
    color: rgb(59, 130, 246);
    font-weight: 600;
  }

  .mobile-user-section {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(229, 231, 235, 0.8);
  }

  .mobile-user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .mobile-login-button {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 0.5rem;
    background: rgba(59, 130, 246, 0.1);
    color: rgb(59, 130, 246);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .mobile-login-button:hover {
    background: rgba(59, 130, 246, 0.2);
  }
</style>