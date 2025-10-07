<script lang="ts">
  import type { Tag } from '$lib/types/models';

  // Props
  let {
    available_tags = [],
    selected_tags = [],
    placeholder = 'Add tags...',
    max_tags = 10,
    allow_create = true,
    disabled = false,
    error = '',
    on_tags_change,
    on_tag_create
  }: {
    available_tags: Tag[];
    selected_tags: Tag[];
    placeholder?: string;
    max_tags?: number;
    allow_create?: boolean;
    disabled?: boolean;
    error?: string;
    on_tags_change: (tags: Tag[]) => void;
    on_tag_create?: (name: string) => Promise<Tag>;
  } = $props();

  // Local state
  let input_value = $state('');
  let is_open = $state(false);
  let highlighted_index = $state(-1);
  let input_element: HTMLInputElement;

  // Computed
  let filtered_suggestions = $derived(available_tags.filter(tag => {
    const is_selected = selected_tags.some(selected => selected.id === tag.id);
    const matches_input = tag.name.toLowerCase().includes(input_value.toLowerCase());
    return !is_selected && matches_input && input_value.length > 0;
  }));

  let can_add_more = $derived(selected_tags.length < max_tags);
  let exact_match = $derived(available_tags.find(tag => 
    tag.name.toLowerCase() === input_value.toLowerCase()
  ));
  let show_create_option = $derived(allow_create && 
    input_value.length > 0 && 
    !exact_match && 
    can_add_more);

  function add_tag(tag: Tag) {
    if (!can_add_more) return;
    
    const new_tags = [...selected_tags, tag];
    on_tags_change(new_tags);
    clear_input();
  }

  function remove_tag(tag: Tag) {
    const new_tags = selected_tags.filter(t => t.id !== tag.id);
    on_tags_change(new_tags);
  }

  async function create_and_add_tag(name: string) {
    if (!on_tag_create || !can_add_more) return;
    
    try {
      const new_tag = await on_tag_create(name);
      add_tag(new_tag);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  }

  function clear_input() {
    input_value = '';
    is_open = false;
    highlighted_index = -1;
  }

  function handle_input() {
    is_open = input_value.length > 0;
    highlighted_index = -1;
  }

  function handle_keydown(event: KeyboardEvent) {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (highlighted_index >= 0 && filtered_suggestions[highlighted_index]) {
          add_tag(filtered_suggestions[highlighted_index]);
        } else if (show_create_option) {
          create_and_add_tag(input_value);
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (filtered_suggestions.length > 0) {
          highlighted_index = Math.min(highlighted_index + 1, filtered_suggestions.length - 1);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        highlighted_index = Math.max(highlighted_index - 1, -1);
        break;

      case 'Escape':
        clear_input();
        input_element?.blur();
        break;

      case 'Backspace':
        if (input_value === '' && selected_tags.length > 0) {
          remove_tag(selected_tags[selected_tags.length - 1]);
        }
        break;
    }
  }

  function handle_blur() {
    // Delay to allow click events on dropdown items
    setTimeout(() => {
      is_open = false;
      highlighted_index = -1;
    }, 150);
  }

  function handle_focus() {
    if (input_value.length > 0) {
      is_open = true;
    }
  }

  function get_tag_style(tag: Tag) {
    return {
      backgroundColor: tag.color || '#6b7280',
      color: get_contrast_color(tag.color || '#6b7280')
    };
  }

  function get_contrast_color(hex_color: string): string {
    // Convert hex to RGB
    const hex = hex_color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }
</script>

<div class="tag-input-container">
  <div class="tag-input" class:error={error} class:disabled>
    <!-- Selected Tags -->
    <div class="selected-tags">
      {#each selected_tags as tag (tag.id)}
        <span class="tag" style:background-color={tag.color} style:color={get_contrast_color(tag.color)}>
          <span class="tag__text">{tag.name}</span>
          <button
            type="button"
            class="tag__remove"
            onclick={() => remove_tag(tag)}
            aria-label="Remove {tag.name} tag"
            disabled={disabled}
          >
            ×
          </button>
        </span>
      {/each}
    </div>

    <!-- Input -->
    <input
      bind:this={input_element}
      bind:value={input_value}
      type="text"
      class="tag-input__field"
      {placeholder}
      {disabled}
      oninput={handle_input}
      onkeydown={handle_keydown}
      onfocus={handle_focus}
      onblur={handle_blur}
      aria-expanded={is_open}
      aria-haspopup="listbox"
      role="combobox"
    />
  </div>

  <!-- Dropdown -->
  {#if is_open && (filtered_suggestions.length > 0 || show_create_option)}
    <div class="dropdown" role="listbox">
      <!-- Existing tags -->
      {#each filtered_suggestions as tag, index (tag.id)}
        <button
          type="button"
          class="dropdown__item"
          class:highlighted={index === highlighted_index}
          onclick={() => add_tag(tag)}
          role="option"
          aria-selected={index === highlighted_index}
        >
          <span class="dropdown__tag-preview" style:background-color={tag.color}></span>
          <span class="dropdown__text">{tag.name}</span>
        </button>
      {/each}

      <!-- Create new tag option -->
      {#if show_create_option}
        <button
          type="button"
          class="dropdown__item dropdown__item--create"
          onclick={() => create_and_add_tag(input_value)}
        >
          <span class="dropdown__icon">+</span>
          <span class="dropdown__text">Create "{input_value}"</span>
        </button>
      {/if}
    </div>
  {/if}

  <!-- Error message -->
  {#if error}
    <span class="error-message">{error}</span>
  {/if}

  <!-- Help text -->
  {#if !can_add_more}
    <span class="help-text">Maximum {max_tags} tags allowed</span>
  {/if}
</div>

<style>
  .tag-input-container {
    position: relative;
    width: 100%;
  }

  .tag-input {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid rgba(209, 213, 219, 0.8);
    border-radius: 0.375rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    transition: all 0.2s ease-in-out;
    min-height: 2.5rem;
  }

  .tag-input:focus-within {
    border-color: rgb(59, 130, 246);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .tag-input.error {
    border-color: rgb(239, 68, 68);
  }

  .tag-input.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    transition: all 0.2s ease-in-out;
  }

  .tag__text {
    line-height: 1;
  }

  .tag__remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    color: inherit;
    font-size: 0.75rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .tag__remove:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
  }

  .tag__remove:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .tag-input__field {
    flex: 1;
    min-width: 8rem;
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.875rem;
    padding: 0.25rem 0;
  }

  .tag-input__field:disabled {
    cursor: not-allowed;
  }

  .tag-input__field::placeholder {
    color: rgb(156, 163, 175);
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    max-height: 12rem;
    overflow-y: auto;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(209, 213, 219, 0.8);
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-top: 0.25rem;
  }

  .dropdown__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    font-size: 0.875rem;
  }

  .dropdown__item:hover,
  .dropdown__item.highlighted {
    background: rgba(59, 130, 246, 0.1);
  }

  .dropdown__item--create {
    border-top: 1px solid rgba(209, 213, 219, 0.3);
    color: rgb(59, 130, 246);
    font-weight: 500;
  }

  .dropdown__tag-preview {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dropdown__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0.75rem;
    height: 0.75rem;
    font-weight: bold;
    flex-shrink: 0;
  }

  .dropdown__text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .error-message {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: rgb(239, 68, 68);
  }

  .help-text {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: rgb(107, 114, 128);
  }

  /* Scrollbar styling for dropdown */
  .dropdown::-webkit-scrollbar {
    width: 0.25rem;
  }

  .dropdown::-webkit-scrollbar-track {
    background: rgba(243, 244, 246, 0.5);
    border-radius: 0.125rem;
  }

  .dropdown::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 0.125rem;
  }

  .dropdown::-webkit-scrollbar-thumb:hover {
    background: rgba(107, 114, 128, 0.7);
  }
</style>