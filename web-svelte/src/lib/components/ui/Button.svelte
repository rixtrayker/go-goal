<script lang="ts">
  import type { ButtonProps } from '$lib/types/models';

  let {
    variant = 'primary',
    size = 'medium',
    disabled = false,
    is_loading = false,
    icon,
    icon_only = false,
    class: custom_class = '',
    'aria-label': aria_label,
    on_click,
    children
  }: ButtonProps & { children?: any; class?: string; 'aria-label'?: string } = $props();

  function handle_click() {
    if (!disabled && !is_loading) {
      on_click();
    }
  }

  function handle_keydown(event: KeyboardEvent) {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled && !is_loading) {
      event.preventDefault();
      on_click();
    }
  }

  let button_classes = $derived([
    'button',
    `button--${variant}`,
    `button--${size}`,
    disabled && 'button--disabled',
    is_loading && 'button--loading',
    icon_only && 'button--icon-only',
    custom_class
  ].filter(Boolean).join(' '));
</script>

<button
  class={button_classes}
  {disabled}
  type="button"
  tabindex={disabled ? -1 : 0}
  aria-label={icon_only ? aria_label : undefined}
  onclick={handle_click}
  onkeydown={handle_keydown}
>
  {#if is_loading}
    <span class="loading-spinner" data-testid="loading-spinner"></span>
  {:else if icon}
    <span class="button__icon" data-testid="button-icon">{icon}</span>
  {/if}
  
  {#if !icon_only}
    <span class="button__text">
      {@render children?.()}
    </span>
  {/if}
</button>

<style>
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    white-space: nowrap;
    user-select: none;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .button:focus {
    outline: 2px solid rgba(59, 130, 246, 0.5);
    outline-offset: 2px;
  }

  /* Variants */
  .button--primary {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8));
    color: white;
    border-color: rgba(59, 130, 246, 0.3);
  }

  .button--primary:hover:not(.button--disabled):not(.button--loading) {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(29, 78, 216, 0.9));
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .button--secondary {
    background: rgba(107, 114, 128, 0.1);
    color: rgb(107, 114, 128);
    border-color: rgba(107, 114, 128, 0.3);
  }

  .button--secondary:hover:not(.button--disabled):not(.button--loading) {
    background: rgba(107, 114, 128, 0.2);
    transform: translateY(-1px);
  }

  .button--ghost {
    background: transparent;
    border-color: transparent;
    color: rgb(107, 114, 128);
  }

  .button--ghost:hover:not(.button--disabled):not(.button--loading) {
    background: rgba(107, 114, 128, 0.1);
  }

  .button--danger {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.8));
    color: white;
    border-color: rgba(239, 68, 68, 0.3);
  }

  .button--danger:hover:not(.button--disabled):not(.button--loading) {
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.9), rgba(185, 28, 28, 0.9));
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  /* Sizes */
  .button--small {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .button--medium {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }

  .button--large {
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
  }

  .button--icon-only {
    padding: 0.625rem;
    aspect-ratio: 1;
  }

  .button--icon-only.button--small {
    padding: 0.5rem;
  }

  .button--icon-only.button--large {
    padding: 0.75rem;
  }

  /* States */
  .button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  .button--loading {
    cursor: wait;
    position: relative;
  }

  .button--loading .button__text,
  .button--loading .button__icon {
    opacity: 0.6;
  }

  .loading-spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .button__icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button__text {
    line-height: 1;
  }
</style>