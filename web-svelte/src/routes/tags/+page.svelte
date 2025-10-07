<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import TagInput from '$lib/components/ui/TagInput.svelte';
  import type { Tag } from '$lib/types/models';

  // Mock data
  let tags: Tag[] = $state([
    {
      id: '1',
      name: 'urgent',
      color: '#ef4444',
      parentId: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      parent: null,
      children: [],
      projects: [],
      goals: [],
      tasks: [],
      notes: []
    },
    {
      id: '2',
      name: 'feature',
      color: '#22c55e',
      parentId: null,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      parent: null,
      children: [],
      projects: [],
      goals: [],
      tasks: [],
      notes: []
    },
    {
      id: '3',
      name: 'bug',
      color: '#f59e0b',
      parentId: null,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      parent: null,
      children: [],
      projects: [],
      goals: [],
      tasks: [],
      notes: []
    },
    {
      id: '4',
      name: 'documentation',
      color: '#3b82f6',
      parentId: null,
      createdAt: '2024-01-04T00:00:00Z',
      updatedAt: '2024-01-04T00:00:00Z',
      parent: null,
      children: [],
      projects: [],
      goals: [],
      tasks: [],
      notes: []
    },
    {
      id: '5',
      name: 'frontend',
      color: '#8b5cf6',
      parentId: 2,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z',
      parent: null,
      children: [],
      projects: [],
      goals: [],
      tasks: [],
      notes: []
    },
    {
      id: '6',
      name: 'backend',
      color: '#ec4899',
      parentId: 2,
      createdAt: '2024-01-06T00:00:00Z',
      updatedAt: '2024-01-06T00:00:00Z',
      parent: null,
      children: [],
      projects: [],
      goals: [],
      tasks: [],
      notes: []
    }
  ]);

  // State
  let selected_tags: Tag[] = $state([]);
  let new_tag_name = $state('');
  let new_tag_color = $state('#3b82f6');
  let search_query = $state('');

  // Computed
  let filtered_tags = $derived(
    search_query 
      ? tags.filter(tag => tag.name.toLowerCase().includes(search_query.toLowerCase()))
      : tags
  );

  let parent_tags = $derived(filtered_tags.filter(tag => tag.parentId === null));
  let child_tags = $derived(filtered_tags.filter(tag => tag.parentId !== null));

  function handle_tags_change(new_tags: Tag[]) {
    selected_tags = new_tags;
  }

  async function handle_tag_create(name: string): Promise<Tag> {
    // Simulate API call
    const new_tag: Tag = {
      id: String(Date.now()),
      name,
      color: new_tag_color,
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parent: null,
      children: [],
      projects: [],
      goals: [],
      tasks: [],
      notes: []
    };
    
    tags = [...tags, new_tag];
    return new_tag;
  }

  function create_tag() {
    if (!new_tag_name.trim()) return;
    
    handle_tag_create(new_tag_name).then(tag => {
      selected_tags = [...selected_tags, tag];
      new_tag_name = '';
    });
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

  function get_children_for_tag(parentId: string): Tag[] {
    return tags.filter(tag => tag.parentId === Number(parentId));
  }
</script>

<svelte:head>
  <title>Tags - Go Goal</title>
</svelte:head>

<div class="tags-page">
  <!-- Header -->
  <div class="page-header">
    <div>
      <h1>Tags</h1>
      <p>Organize your content with tags</p>
    </div>
  </div>

  <!-- Search -->
  <div class="search-section">
    <input
      type="text"
      placeholder="Search tags..."
      class="search-input"
      bind:value={search_query}
    />
  </div>

  <!-- Tag Input Demo -->
  <div class="demo-section">
    <Card title="Tag Input Demo">
      <div class="tag-input-demo">
        <label for="demo-tags">Selected Tags:</label>
        <TagInput
          available_tags={tags}
          selected_tags={selected_tags}
          on_tags_change={handle_tags_change}
          on_tag_create={handle_tag_create}
          placeholder="Add or search tags..."
        />
        
        {#if selected_tags.length > 0}
          <div class="selected-info">
            <p><strong>Selected:</strong> {selected_tags.map(t => t.name).join(', ')}</p>
          </div>
        {/if}
      </div>
    </Card>
  </div>

  <!-- Create New Tag -->
  <div class="create-section">
    <Card title="Create New Tag">
      <div class="create-form">
        <div class="form-row">
          <div class="form-group">
            <label for="tag-name">Tag Name:</label>
            <input
              id="tag-name"
              type="text"
              placeholder="Enter tag name..."
              class="form-input"
              bind:value={new_tag_name}
            />
          </div>
          
          <div class="form-group">
            <label for="tag-color">Color:</label>
            <input
              id="tag-color"
              type="color"
              class="color-input"
              bind:value={new_tag_color}
            />
          </div>
          
          <Button 
            variant="primary" 
            on_click={create_tag}
            disabled={!new_tag_name.trim()}
          >
            Create Tag
          </Button>
        </div>
        
        {#if new_tag_name.trim()}
          <div class="preview">
            <span>Preview:</span>
            <span 
              class="tag-preview"
              style:background-color={new_tag_color}
              style:color={get_contrast_color(new_tag_color)}
            >
              {new_tag_name}
            </span>
          </div>
        {/if}
      </div>
    </Card>
  </div>

  <!-- All Tags Display -->
  <div class="tags-display">
    <h2>All Tags ({filtered_tags.length})</h2>
    
    <!-- Parent Tags -->
    <div class="tags-section">
      <h3>Parent Tags</h3>
      <div class="tags-grid">
        {#each parent_tags as tag (tag.id)}
          <Card variant="outlined">
            <div class="tag-card">
              <div class="tag-header">
                <span 
                  class="tag-badge"
                  style:background-color={tag.color}
                  style:color={get_contrast_color(tag.color)}
                >
                  {tag.name}
                </span>
                <span class="tag-id">#{tag.id}</span>
              </div>
              
              <div class="tag-meta">
                <div class="meta-item">
                  <span>Created:</span>
                  <span>{new Date(tag.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="meta-item">
                  <span>Updated:</span>
                  <span>{new Date(tag.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <!-- Child tags -->
              {#if get_children_for_tag(tag.id).length > 0}
                <div class="child-tags">
                  <span class="child-label">Children:</span>
                  <div class="child-tags-list">
                    {#each get_children_for_tag(tag.id) as child (child.id)}
                      <span 
                        class="child-tag"
                        style:background-color={child.color}
                        style:color={get_contrast_color(child.color)}
                      >
                        {child.name}
                      </span>
                    {/each}
                  </div>
                </div>
              {/if}
              
              <div class="tag-usage">
                <span>Usage: 0 items</span>
              </div>
            </div>
          </Card>
        {/each}
      </div>
    </div>

    <!-- Child Tags -->
    {#if child_tags.length > 0}
      <div class="tags-section">
        <h3>Child Tags</h3>
        <div class="tags-grid">
          {#each child_tags as tag (tag.id)}
            <Card variant="outlined">
              <div class="tag-card">
                <div class="tag-header">
                  <span 
                    class="tag-badge"
                    style:background-color={tag.color}
                    style:color={get_contrast_color(tag.color)}
                  >
                    {tag.name}
                  </span>
                  <span class="tag-id">#{tag.id}</span>
                </div>
                
                <div class="tag-meta">
                  <div class="meta-item">
                    <span>Parent:</span>
                    <span>#{tag.parentId}</span>
                  </div>
                  <div class="meta-item">
                    <span>Created:</span>
                    <span>{new Date(tag.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div class="tag-usage">
                  <span>Usage: 0 items</span>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if filtered_tags.length === 0}
    <div class="empty-state">
      <h3>No tags found</h3>
      <p>Create your first tag to start organizing your content!</p>
    </div>
  {/if}
</div>

<style>
  .tags-page {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .page-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: rgb(17, 24, 39);
    margin: 0 0 0.5rem 0;
  }

  .page-header p {
    color: rgb(107, 114, 128);
    margin: 0;
  }

  .search-section {
    margin-bottom: 1.5rem;
  }

  .search-input {
    width: 100%;
    max-width: 400px;
    padding: 0.75rem;
    border: 1px solid rgba(209, 213, 219, 0.8);
    border-radius: 0.5rem;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
  }

  .search-input:focus {
    outline: none;
    border-color: rgb(59, 130, 246);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .demo-section {
    margin-bottom: 2rem;
  }

  .tag-input-demo {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .tag-input-demo label {
    font-weight: 500;
    color: rgb(55, 65, 81);
  }

  .selected-info {
    padding: 0.75rem;
    background: rgba(249, 250, 251, 0.5);
    border-radius: 0.5rem;
    border: 1px solid rgba(229, 231, 235, 0.8);
  }

  .selected-info p {
    margin: 0;
    font-size: 0.875rem;
    color: rgb(107, 114, 128);
  }

  .create-section {
    margin-bottom: 2rem;
  }

  .create-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-row {
    display: flex;
    align-items: end;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-weight: 500;
    color: rgb(55, 65, 81);
    font-size: 0.875rem;
  }

  .form-input {
    padding: 0.5rem;
    border: 1px solid rgba(209, 213, 219, 0.8);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    min-width: 200px;
  }

  .color-input {
    width: 60px;
    height: 40px;
    border: 1px solid rgba(209, 213, 219, 0.8);
    border-radius: 0.375rem;
    cursor: pointer;
  }

  .preview {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: rgb(107, 114, 128);
  }

  .tag-preview {
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    font-weight: 500;
    font-size: 0.875rem;
  }

  .tags-display h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: rgb(17, 24, 39);
    margin-bottom: 1.5rem;
  }

  .tags-section {
    margin-bottom: 2rem;
  }

  .tags-section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgb(55, 65, 81);
    margin-bottom: 1rem;
  }

  .tags-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .tag-card {
    padding: 1rem;
  }

  .tag-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .tag-badge {
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    font-weight: 500;
    font-size: 0.875rem;
  }

  .tag-id {
    font-size: 0.75rem;
    color: rgb(156, 163, 175);
    font-family: monospace;
  }

  .tag-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 1rem;
  }

  .meta-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: rgb(107, 114, 128);
  }

  .child-tags {
    margin-bottom: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(229, 231, 235, 0.5);
  }

  .child-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: rgb(107, 114, 128);
    display: block;
    margin-bottom: 0.5rem;
  }

  .child-tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .child-tag {
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .tag-usage {
    font-size: 0.75rem;
    color: rgb(156, 163, 175);
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(229, 231, 235, 0.5);
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    background: rgba(249, 250, 251, 0.5);
    border-radius: 1rem;
    border: 2px dashed rgba(209, 213, 219, 0.8);
  }

  .empty-state h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgb(107, 114, 128);
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    color: rgb(156, 163, 175);
  }

  @media (max-width: 768px) {
    .tags-page {
      padding: 1rem;
    }

    .form-row {
      flex-direction: column;
      align-items: stretch;
    }

    .tags-grid {
      grid-template-columns: 1fr;
    }
  }
</style>