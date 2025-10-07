<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  // Props
  let {
    is_open = false,
    title = '',
    size = 'medium',
    closable = true,
    mask_closable = true,
    on_close,
    children
  }: {
    is_open: boolean;
    title?: string;
    size?: 'small' | 'medium' | 'large' | 'fullscreen';
    closable?: boolean;
    mask_closable?: boolean;
    on_close: () => void;
    children?: any;
  } = $props();

  let modal_element: HTMLDivElement;
  let dialog_element: HTMLDivElement;
  let original_overflow: string;

  $effect(() => {
    if (is_open) {
      handle_open();
    } else {
      handle_close();
    }
  });

  function handle_open() {
    // Prevent background scroll
    original_overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    // Focus management
    requestAnimationFrame(() => {
      focus_first_element();
    });
  }

  function handle_close() {
    // Restore background scroll
    if (original_overflow !== undefined) {
      document.body.style.overflow = original_overflow;
    }
  }

  function focus_first_element() {
    if (!dialog_element) return;
    
    const focusable_elements = dialog_element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusable_elements.length > 0) {
      (focusable_elements[0] as HTMLElement).focus();
    }
  }

  function handle_keydown(event: KeyboardEvent) {
    if (!is_open) return;

    if (event.key === 'Escape' && closable) {
      on_close();
      return;
    }

    if (event.key === 'Tab') {
      handle_tab_navigation(event);
    }
  }

  function handle_tab_navigation(event: KeyboardEvent) {
    if (!dialog_element) return;

    const focusable_elements = Array.from(
      dialog_element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    if (focusable_elements.length === 0) return;

    const first_element = focusable_elements[0];
    const last_element = focusable_elements[focusable_elements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first_element) {
        event.preventDefault();
        last_element.focus();
      }
    } else {
      if (document.activeElement === last_element) {
        event.preventDefault();
        first_element.focus();
      }
    }
  }

  function handle_overlay_click(event: MouseEvent) {
    if (mask_closable && event.target === modal_element) {
      on_close();
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handle_keydown);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handle_keydown);
    // Restore scroll when component is destroyed
    if (original_overflow !== undefined) {
      document.body.style.overflow = original_overflow;
    }
  });
</script>

{#if is_open}
  <div
    bind:this={modal_element}
    class="modal-overlay"
    onclick={handle_overlay_click}
    data-testid="modal-overlay"
  >
    <div
      bind:this={dialog_element}
      class="modal__dialog modal__dialog--{size}"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <!-- Header -->
      {#if title || closable}
        <div class="modal__header">
          {#if title}
            <h2 id="modal-title" class="modal__title">{title}</h2>
          {/if}
          
          {#if closable}
            <button
              type="button"
              class="modal__close"
              onclick={on_close}
              aria-label="Close modal"
            >
              ✕
            </button>
          {/if}
        </div>
      {/if}

      <!-- Content -->
      <div class="modal__content">
        {@render children?.()}
      </div>

    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    animation: fade-in 0.2s ease-out;
    padding: 1rem;
  }

  .modal__dialog {
    position: relative;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    max-height: calc(100vh - 2rem);
    overflow: hidden;
    animation: slide-up 0.2s ease-out;
    display: flex;
    flex-direction: column;
  }

  .modal__dialog--small {
    width: 100%;
    max-width: 28rem;
  }

  .modal__dialog--medium {
    width: 100%;
    max-width: 32rem;
  }

  .modal__dialog--large {
    width: 100%;
    max-width: 48rem;
  }

  .modal__dialog--fullscreen {
    width: calc(100vw - 2rem);
    height: calc(100vh - 2rem);
    max-width: none;
    max-height: none;
  }

  .modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 1.5rem 0 1.5rem;
    flex-shrink: 0;
  }

  .modal__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgb(17, 24, 39);
    margin: 0;
  }

  .modal__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 0.375rem;
    background: transparent;
    color: rgb(107, 114, 128);
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .modal__close:hover {
    background: rgba(107, 114, 128, 0.1);
    color: rgb(55, 65, 81);
  }

  .modal__close:focus {
    outline: 2px solid rgba(59, 130, 246, 0.5);
    outline-offset: 2px;
  }

  .modal__content {
    padding: 1.5rem;
    flex: 1;
    overflow-y: auto;
  }

  .modal__footer {
    padding: 0 1.5rem 1.5rem 1.5rem;
    border-top: 1px solid rgba(229, 231, 235, 0.5);
    margin-top: 1rem;
    flex-shrink: 0;
  }

  /* Animations */
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(1rem) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .modal-overlay {
      padding: 0.5rem;
    }

    .modal__dialog--small,
    .modal__dialog--medium,
    .modal__dialog--large {
      width: 100%;
      max-width: none;
    }

    .modal__dialog--fullscreen {
      width: 100vw;
      height: 100vh;
      margin: 0;
      border-radius: 0;
    }

    .modal__header,
    .modal__content,
    .modal__footer {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }

  /* Scrollbar styling */
  .modal__content::-webkit-scrollbar {
    width: 0.375rem;
  }

  .modal__content::-webkit-scrollbar-track {
    background: rgba(243, 244, 246, 0.5);
    border-radius: 0.1875rem;
  }

  .modal__content::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 0.1875rem;
  }

  .modal__content::-webkit-scrollbar-thumb:hover {
    background: rgba(107, 114, 128, 0.7);
  }
</style>