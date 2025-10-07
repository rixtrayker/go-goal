<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import type { Task, Project, Goal, TaskFormData, TaskFormErrors } from '$lib/types/models';

  // Props
  let {
    task = null,
    projects = [],
    goals = [],
    errors = {},
    is_loading = false,
    on_submit,
    on_cancel
  }: {
    task?: Task | null;
    projects: Project[];
    goals: Goal[];
    errors?: TaskFormErrors;
    is_loading?: boolean;
    on_submit: (data: TaskFormData) => void;
    on_cancel: () => void;
  } = $props();

  // Form state
  let form_data: TaskFormData = $state({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || '',
    priority: task?.priority || '',
    projectId: task?.projectId || undefined,
    goalId: task?.goalId || null,
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    flowId: task?.flowId || null,
  });

  // Local validation errors
  let validation_errors: TaskFormErrors = $state({});

  // Computed
  let is_edit_mode = $derived(!!task);
  let submit_text = $derived(is_loading 
    ? (is_edit_mode ? 'Updating...' : 'Creating...') 
    : (is_edit_mode ? 'Update Task' : 'Create Task'));

  // Filter goals by selected project
  let filtered_goals = $derived(form_data.projectId 
    ? goals.filter(goal => goal.projectId === Number(form_data.projectId))
    : goals);

  function validate_form(): boolean {
    validation_errors = {};

    if (!form_data.title?.trim()) {
      validation_errors.title = 'Title is required';
    } else if (form_data.title.length < 3) {
      validation_errors.title = 'Title must be at least 3 characters';
    }

    if (!form_data.priority) {
      validation_errors.priority = 'Priority is required';
    }

    if (!form_data.status) {
      validation_errors.status = 'Status is required';
    }

    if (!form_data.projectId) {
      validation_errors.projectId = 'Project is required';
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

    const submit_data: TaskFormData = {
      ...form_data,
      projectId: Number(form_data.projectId),
      goalId: form_data.goalId ? Number(form_data.goalId) : null,
      dueDate: form_data.dueDate ? new Date(form_data.dueDate).toISOString() : undefined,
    };

    on_submit(submit_data);
  }

  function handle_cancel() {
    on_cancel();
  }

  function handle_project_change() {
    // Reset goal selection when project changes
    form_data.goalId = null;
  }

  // Merge validation errors with external errors
  let display_errors = $derived({ ...validation_errors, ...errors });
</script>

<form class="task-form" onsubmit={handle_form_submit}>
  <div class="form-grid">
    <!-- Title -->
    <div class="form-field">
      <label for="task-title" class="form-label">
        Title <span class="required">*</span>
      </label>
      <input
        id="task-title"
        type="text"
        class="form-input"
        class:error={display_errors.title}
        bind:value={form_data.title}
        placeholder="Enter task title"
        disabled={is_loading}
        required
      />
      {#if display_errors.title}
        <span class="error-message">{display_errors.title}</span>
      {/if}
    </div>

    <!-- Priority -->
    <div class="form-field">
      <label for="task-priority" class="form-label">
        Priority <span class="required">*</span>
      </label>
      <select
        id="task-priority"
        class="form-select"
        class:error={display_errors.priority}
        bind:value={form_data.priority}
        disabled={is_loading}
        required
      >
        <option value="">Select priority</option>
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
        <option value="urgent">Urgent</option>
      </select>
      {#if display_errors.priority}
        <span class="error-message">{display_errors.priority}</span>
      {/if}
    </div>

    <!-- Status -->
    <div class="form-field">
      <label for="task-status" class="form-label">
        Status <span class="required">*</span>
      </label>
      <select
        id="task-status"
        class="form-select"
        class:error={display_errors.status}
        bind:value={form_data.status}
        disabled={is_loading}
        required
      >
        <option value="">Select status</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      {#if display_errors.status}
        <span class="error-message">{display_errors.status}</span>
      {/if}
    </div>

    <!-- Due Date -->
    <div class="form-field">
      <label for="task-due-date" class="form-label">Due Date</label>
      <input
        id="task-due-date"
        type="date"
        class="form-input"
        class:error={display_errors.dueDate}
        bind:value={form_data.dueDate}
        disabled={is_loading}
      />
      {#if display_errors.dueDate}
        <span class="error-message">{display_errors.dueDate}</span>
      {/if}
    </div>

    <!-- Project -->
    <div class="form-field">
      <label for="task-project" class="form-label">
        Project <span class="required">*</span>
      </label>
      <select
        id="task-project"
        class="form-select"
        class:error={display_errors.projectId}
        bind:value={form_data.projectId}
        onchange={handle_project_change}
        disabled={is_loading}
        required
      >
        <option value="">Select project</option>
        {#each projects as project}
          <option value={project.id}>{project.title}</option>
        {/each}
      </select>
      {#if display_errors.projectId}
        <span class="error-message">{display_errors.projectId}</span>
      {/if}
    </div>

    <!-- Goal -->
    <div class="form-field">
      <label for="task-goal" class="form-label">Goal (Optional)</label>
      <select
        id="task-goal"
        class="form-select"
        class:error={display_errors.goalId}
        bind:value={form_data.goalId}
        disabled={is_loading || !form_data.projectId}
      >
        <option value="">Select goal</option>
        {#each filtered_goals as goal}
          <option value={goal.id}>{goal.title}</option>
        {/each}
      </select>
      {#if display_errors.goalId}
        <span class="error-message">{display_errors.goalId}</span>
      {/if}
      {#if !form_data.projectId}
        <span class="help-text">Select a project first to choose a goal</span>
      {/if}
    </div>

    <!-- Description -->
    <div class="form-field form-field--full">
      <label for="task-description" class="form-label">Description</label>
      <textarea
        id="task-description"
        class="form-textarea"
        class:error={display_errors.description}
        bind:value={form_data.description}
        placeholder="Enter task description"
        disabled={is_loading}
        rows="3"
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
  .task-form {
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
    min-height: 4rem;
  }

  .error-message {
    font-size: 0.75rem;
    color: rgb(239, 68, 68);
    margin-top: 0.25rem;
  }

  .help-text {
    font-size: 0.75rem;
    color: rgb(107, 114, 128);
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