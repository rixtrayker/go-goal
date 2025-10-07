<script lang="ts">
  // Props
  let {
    title = '',
    variant = 'default',
    padding = 'medium',
    disabled = false,
    is_loading = false,
    on_click,
    class: custom_class = '',
    children
  }: {
    title?: string;
    variant?: 'default' | 'outlined' | 'elevated';
    padding?: 'none' | 'small' | 'medium' | 'large';
    disabled?: boolean;
    is_loading?: boolean;
    on_click?: () => void;
    class?: string;
    children?: any;
  } = $props();

  // Computed
  let is_clickable = $derived(!!on_click);
  let card_classes = $derived([
    'card',
    `card--${variant}`,
    `card--padding-${padding}`,
    is_clickable && 'card--clickable',
    disabled && 'card--disabled',
    is_loading && 'card--loading',
    custom_class
  ].filter(Boolean).join(' '));

  function handle_click() {
    if (on_click && !disabled && !is_loading) {
      on_click();
    }
  }

  function handle_keydown(event: KeyboardEvent) {
    if ((event.key === 'Enter' || event.key === ' ') && on_click && !disabled && !is_loading) {
      event.preventDefault();
      on_click();
    }
  }
</script>

<div
  class={card_classes}
  role={is_clickable ? 'button' : undefined}
  tabindex={is_clickable && !disabled ? 0 : -1}
  onclick={handle_click}
  onkeydown={handle_keydown}
  data-testid="card"
>
  <!-- Loading overlay -->
  {#if is_loading}
    <div class="card__loading-overlay">
      <div class="loading-spinner" data-testid="loading-spinner"></div>
    </div>
  {/if}

  <!-- Header -->
  {#if title}
    <div class="card__header">
      <h3 class="card__title">{title}</h3>
    </div>
  {/if}

  <!-- Content -->
  <div class="card__content">
    {@render children?.()}
  </div>

</div>

<style>
  .card {
    position: relative;
    border-radius: 0.75rem;
    transition: all 0.2s ease-in-out;
    overflow: hidden;
  }

  /* Variants */
  .card--default {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .card--outlined {
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(209, 213, 219, 0.8);
  }

  .card--elevated {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  /* Padding variants */
  .card--padding-none {
    padding: 0;
  }

  .card--padding-small .card__header,
  .card--padding-small .card__content,
  .card--padding-small .card__footer {
    padding: 0.75rem;
  }

  .card--padding-medium .card__header,
  .card--padding-medium .card__content,
  .card--padding-medium .card__footer {
    padding: 1rem;
  }

  .card--padding-large .card__header,
  .card--padding-large .card__content,
  .card--padding-large .card__footer {
    padding: 1.5rem;
  }

  /* Clickable state */
  .card--clickable {
    cursor: pointer;
    user-select: none;
  }

  .card--clickable:hover:not(.card--disabled):not(.card--loading) {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .card--clickable:focus {
    outline: 2px solid rgba(59, 130, 246, 0.5);
    outline-offset: 2px;
  }

  .card--clickable:active:not(.card--disabled):not(.card--loading) {
    transform: translateY(0);
  }

  /* Disabled state */
  .card--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Loading state */
  .card--loading {
    pointer-events: none;
  }

  .card__loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(2px);
  }

  .loading-spinner {
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-top: 2px solid rgb(59, 130, 246);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Header */
  .card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  }

  .card__header-content {
    flex: 1;
  }

  .card__title {
    font-size: 1.125rem;
    font-weight: 600;
    color: rgb(17, 24, 39);
    margin: 0;
  }

  .card__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 1rem;
  }

  /* Content */
  .card__content {
    flex: 1;
  }

  /* Footer */
  .card__footer {
    border-top: 1px solid rgba(229, 231, 235, 0.5);
    background: rgba(249, 250, 251, 0.5);
  }

  /* No padding override */
  .card--padding-none .card__header {
    padding: 1rem 1rem 0 1rem;
  }

  .card--padding-none .card__content {
    padding: 1rem;
  }

  .card--padding-none .card__footer {
    padding: 0 1rem 1rem 1rem;
  }

  /* When header has no bottom border (no content below) */
  .card__header:last-child {
    border-bottom: none;
  }

  /* When footer has no top border (no content above) */
  .card__footer:first-child {
    border-top: none;
    background: none;
  }
</style>