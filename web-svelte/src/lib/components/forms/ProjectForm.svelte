<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import type { Project, Workspace, ProjectFormData, ProjectFormErrors } from '$lib/types/models';

  // Props
  let {
    project = null,
    workspaces = [],
    errors = {},
    is_loading = false,
    on_submit,
    on_cancel
  }: {
    project?: Project | null;
    workspaces: Workspace[];
    errors?: ProjectFormErrors;
    is_loading?: boolean;
    on_submit: (data: ProjectFormData) => void;
    on_cancel: () => void;
  } = $props();

  // Form state
  let form_data: ProjectFormData = $state({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || '',
    workspaceId: project?.workspaceId || undefined,
    flowId: project?.flowId || null,
  });

  // Local validation errors
  let validation_errors: ProjectFormErrors = $state({});

  // Computed
  let is_edit_mode = $derived(!!project);
  let submit_text = $derived(is_loading 
    ? (is_edit_mode ? 'Updating...' : 'Creating...') 
    : (is_edit_mode ? 'Update Project' : 'Create Project'));

  function validate_form(): boolean {
    validation_errors = {};

    if (!form_data.title?.trim()) {
      validation_errors.title = 'Title is required';
    } else if (form_data.title.length < 3) {
      validation_errors.title = 'Title must be at least 3 characters';
    }

    if (!form_data.status) {
      validation_errors.status = 'Status is required';
    }

    if (!form_data.workspaceId) {
      validation_errors.workspaceId = 'Workspace is required';
    }

    return Object.keys(validation_errors).length === 0;
  }

  function handle_form_submit(event: SubmitEvent) {
    event.preventDefault();
    submit_form();
  }

  function submit_form() {
    if (!validate_form()) {
      return;
    }

    const submit_data: ProjectFormData = {
      ...form_data,
      workspaceId: Number(form_data.workspaceId),
    };

    on_submit(submit_data);
  }

  function handle_cancel() {
    on_cancel();
  }

  // Merge validation errors with external errors
  let display_errors = $derived({ ...validation_errors, ...errors });
</script>

<form class="project-form" onsubmit={handle_form_submit}>
  <div class="form-grid">
    <!-- Title -->
    <div class="form-field">
      <label for="project-title" class="form-label">
        Title <span class="required">*</span>
      </label>
      <input
        id="project-title"
        type="text"
        class="form-input"
        class:error={display_errors.title}
        bind:value={form_data.title}
        placeholder="Enter project title"
        disabled={is_loading}
        required
      />
      {#if display_errors.title}
        <span class="error-message">{display_errors.title}</span>
      {/if}
    </div>

    <!-- Status -->
    <div class="form-field">
      <label for="project-status" class="form-label">
        Status <span class="required">*</span>
      </label>
      <select
        id="project-status"
        class="form-select"
        class:error={display_errors.status}
        bind:value={form_data.status}
        disabled={is_loading}
        required
      >
        <option value="">Select status</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="archived">Archived</option>
        <option value="on_hold">On Hold</option>
      </select>
      {#if display_errors.status}
        <span class="error-message">{display_errors.status}</span>
      {/if}
    </div>

    <!-- Workspace -->
    <div class="form-field">
      <label for="project-workspace" class="form-label">
        Workspace <span class="required">*</span>
      </label>
      <select
        id="project-workspace"
        class="form-select"
        class:error={display_errors.workspaceId}
        bind:value={form_data.workspaceId}
        disabled={is_loading}
        required
      >
        <option value="">Select workspace</option>
        {#each workspaces as workspace}
          <option value={workspace.id}>{workspace.name}</option>
        {/each}
      </select>
      {#if display_errors.workspaceId}
        <span class="error-message">{display_errors.workspaceId}</span>
      {/if}
    </div>

    <!-- Description -->
    <div class="form-field form-field--full">
      <label for="project-description" class="form-label">Description</label>
      <textarea
        id="project-description"
        class="form-textarea"
        class:error={display_errors.description}
        bind:value={form_data.description}
        placeholder="Enter project description"
        disabled={is_loading}
        rows="4"
      ></textarea>
      {#if display_errors.description}
        <span class="error-message">{display_errors.description}</span>
      {/if}
    </div>
  </div>

  <!-- Form Actions -->
  <div class="form-actions">
    <Button
      variant="ghost"
      on_click={handle_cancel}
      disabled={is_loading}
    >
      Cancel
    </Button>
    
    <Button
      variant="primary"
      is_loading={is_loading}
      disabled={is_loading}
      on_click={submit_form}
    >
      {submit_text}
    </Button>
  </div>
</form>

<style>
  .project-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 48rem;
    margin: 0 auto;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-field--full {
    grid-column: 1 / -1;
  }

  .form-label {
    font-weight: 500;
    color: rgb(55, 65, 81);
    font-size: 0.875rem;
  }

  .required {
    color: rgb(239, 68, 68);
  }

  .form-input,
  .form-textarea,
  .form-select {
    padding: 0.625rem 0.75rem;
    border: 1px solid rgba(209, 213, 219, 0.8);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: all 0.2s ease-in-out;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
  }

  .form-input:focus,
  .form-textarea:focus,
  .form-select:focus {
    outline: none;
    border-color: rgb(59, 130, 246);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-input.error,
  .form-textarea.error,
  .form-select.error {
    border-color: rgb(239, 68, 68);
  }

  .form-input:disabled,
  .form-textarea:disabled,
  .form-select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .form-textarea {
    resize: vertical;
    min-height: 5rem;
  }

  .error-message {
    font-size: 0.75rem;
    color: rgb(239, 68, 68);
    margin-top: 0.25rem;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(209, 213, 219, 0.3);
  }

  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
    
    .form-actions {
      flex-direction: column-reverse;
    }
  }
</style>