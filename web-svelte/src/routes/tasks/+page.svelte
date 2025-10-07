<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import TaskForm from '$lib/components/forms/TaskForm.svelte';
  import type { Task, Project, Goal } from '$lib/types/models';

  // Mock data  
  let tasks: Task[] = [
    {
      id: '1',
      title: 'Design homepage mockups',
      description: 'Create wireframes and high-fidelity mockups for the new homepage',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2025-01-10T00:00:00Z',
      goalId: 1,
      projectId: 1,
      flowId: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      goal: {
        id: '1',
        title: 'Launch Marketing Campaign',
        description: 'Complete social media marketing campaign',
        priority: 'high',
        dueDate: '2025-01-15T00:00:00Z',
        status: 'active',
        projectId: 1,
        flowId: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        project: {} as any,
        tasks: [],
        notes: [],
        tags: [],
        flow: null
      },
      project: {
        id: '1',
        title: 'Website Redesign',
        description: 'Complete overhaul of company website',
        status: 'active',
        workspaceId: 1,
        flowId: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        goals: [],
        tasks: [],
        notes: [],
        tags: [],
        flow: null
      },
      notes: [],
      tags: [],
      flow: null
    },
    {
      id: '2',
      title: 'Implement user authentication',
      description: 'Set up secure user login and registration system',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-01-20T00:00:00Z',
      goalId: 2,
      projectId: 2,
      flowId: null,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      goal: {
        id: '2',
        title: 'Improve User Experience',
        description: 'Enhance UI/UX of mobile app',
        priority: 'medium',
        dueDate: '2025-02-01T00:00:00Z',
        status: 'active',
        projectId: 2,
        flowId: null,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        project: {} as any,
        tasks: [],
        notes: [],
        tags: [],
        flow: null
      },
      project: {
        id: '2',
        title: 'Mobile App Development',
        description: 'Native mobile app development',
        status: 'active',
        workspaceId: 1,
        flowId: null,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        goals: [],
        tasks: [],
        notes: [],
        tags: [],
        flow: null
      },
      notes: [],
      tags: [],
      flow: null
    },
    {
      id: '3',
      title: 'Write API documentation',
      description: 'Document all REST API endpoints with examples',
      status: 'completed',
      priority: 'low',
      dueDate: null,
      goalId: 3,
      projectId: 3,
      flowId: null,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      goal: {
        id: '3',
        title: 'Update Documentation',
        description: 'Refresh technical documentation',
        priority: 'low',
        dueDate: null,
        status: 'completed',
        projectId: 3,
        flowId: null,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
        project: {} as any,
        tasks: [],
        notes: [],
        tags: [],
        flow: null
      },
      project: {
        id: '3',
        title: 'Documentation Updates',
        description: 'Update technical docs',
        status: 'completed',
        workspaceId: 1,
        flowId: null,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
        goals: [],
        tasks: [],
        notes: [],
        tags: [],
        flow: null
      },
      notes: [],
      tags: [],
      flow: null
    }
  ];

  let projects: Project[] = tasks.map(t => t.project);
  let goals: Goal[] = tasks.map(t => t.goal!);

  // State
  let is_create_modal_open = $state(false);
  let is_edit_modal_open = $state(false);
  let selected_task: Task | null = $state(null);
  let filter_status = $state('all');
  let filter_priority = $state('all');

  // Computed
  let filtered_tasks = $derived(
    tasks.filter(task => {
      const status_match = filter_status === 'all' || task.status === filter_status;
      const priority_match = filter_priority === 'all' || task.priority === filter_priority;
      return status_match && priority_match;
    })
  );

  function open_create_modal() {
    selected_task = null;
    is_create_modal_open = true;
  }

  function open_edit_modal(task: Task) {
    selected_task = task;
    is_edit_modal_open = true;
  }

  function close_modals() {
    is_create_modal_open = false;
    is_edit_modal_open = false;
    selected_task = null;
  }

  function handle_task_submit(data: any) {
    console.log('Task data:', data);
    // In real app, this would call API
    close_modals();
  }

  function get_priority_color(priority: string) {
    switch (priority) {
      case 'urgent':
        return 'rgb(239, 68, 68)';
      case 'high':
        return 'rgb(245, 158, 11)';
      case 'medium':
        return 'rgb(59, 130, 246)';
      case 'low':
        return 'rgb(34, 197, 94)';
      default:
        return 'rgb(107, 114, 128)';
    }
  }

  function get_status_color(status: string) {
    switch (status) {
      case 'pending':
        return 'rgb(107, 114, 128)';
      case 'in_progress':
        return 'rgb(59, 130, 246)';
      case 'completed':
        return 'rgb(34, 197, 94)';
      case 'cancelled':
        return 'rgb(239, 68, 68)';
      default:
        return 'rgb(107, 114, 128)';
    }
  }

  function get_days_until_due(dueDate: string | null): string {
    if (!dueDate) return '';
    
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    return `${diff} days left`;
  }
</script>

<svelte:head>
  <title>Tasks - Go Goal</title>
</svelte:head>

<div class="tasks-page">
  <!-- Header -->
  <div class="page-header">
    <div>
      <h1>Tasks</h1>
      <p>Manage your tasks and track progress</p>
    </div>
    <Button variant="primary" on_click={open_create_modal}>
      + New Task
    </Button>
  </div>

  <!-- Filters -->
  <div class="filters">
    <div class="filter-group">
      <label for="status-filter">Status:</label>
      <select id="status-filter" bind:value={filter_status} class="filter-select">
        <option value="all">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
    
    <div class="filter-group">
      <label for="priority-filter">Priority:</label>
      <select id="priority-filter" bind:value={filter_priority} class="filter-select">
        <option value="all">All Priorities</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  </div>

  <!-- Tasks List -->
  <div class="tasks-list">
    {#each filtered_tasks as task (task.id)}
      <Card variant="outlined" on_click={() => open_edit_modal(task)}>
        <div class="task-card">
          <div class="task-header">
            <div class="task-title">
              <h3>{task.title}</h3>
              <div class="badges">
                <span 
                  class="priority-badge" 
                  style:background-color={get_priority_color(task.priority)}
                >
                  {task.priority}
                </span>
                <span 
                  class="status-badge" 
                  style:background-color={get_status_color(task.status)}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          
          <p class="task-description">{task.description}</p>
          
          <div class="task-meta">
            <div class="meta-row">
              <span><strong>Project:</strong> {task.project.title}</span>
              {#if task.goal}
                <span><strong>Goal:</strong> {task.goal.title}</span>
              {/if}
            </div>
            
            {#if task.dueDate}
              <div class="meta-row due-date">
                <span><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</span>
                <span class="days-left">({get_days_until_due(task.dueDate)})</span>
              </div>
            {/if}
            
            <div class="meta-row">
              <span><strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}</span>
              <span><strong>Updated:</strong> {new Date(task.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Card>
    {/each}
  </div>

  {#if filtered_tasks.length === 0}
    <div class="empty-state">
      <h3>No tasks found</h3>
      <p>Create your first task to start getting things done!</p>
      <Button variant="primary" on_click={open_create_modal}>
        + Create Task
      </Button>
    </div>
  {/if}
</div>

<!-- Create Task Modal -->
<Modal
  is_open={is_create_modal_open}
  title="Create New Task"
  on_close={close_modals}
>
  <TaskForm
    projects={projects}
    goals={goals}
    on_submit={handle_task_submit}
    on_cancel={close_modals}
  />
</Modal>

<!-- Edit Task Modal -->
<Modal
  is_open={is_edit_modal_open}
  title="Edit Task"
  on_close={close_modals}
>
  {#if selected_task}
    <TaskForm
      task={selected_task}
      projects={projects}
      goals={goals}
      on_submit={handle_task_submit}
      on_cancel={close_modals}
    />
  {/if}
</Modal>

<style>
  .tasks-page {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
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

  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(249, 250, 251, 0.5);
    border-radius: 0.5rem;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-group label {
    font-weight: 500;
    color: rgb(55, 65, 81);
  }

  .filter-select {
    padding: 0.5rem;
    border: 1px solid rgba(209, 213, 219, 0.8);
    border-radius: 0.375rem;
    background: white;
    font-size: 0.875rem;
  }

  .tasks-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .task-card {
    padding: 1.5rem;
  }

  .task-header {
    margin-bottom: 1rem;
  }

  .task-title {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .task-title h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: rgb(17, 24, 39);
    margin: 0;
    flex: 1;
  }

  .badges {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .priority-badge,
  .status-badge {
    color: white;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .task-description {
    color: rgb(107, 114, 128);
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .task-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(229, 231, 235, 0.5);
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    color: rgb(107, 114, 128);
    gap: 1rem;
  }

  .meta-row strong {
    color: rgb(55, 65, 81);
  }

  .due-date .days-left {
    font-size: 0.75rem;
    color: rgb(239, 68, 68);
    font-weight: 500;
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
    margin-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    .tasks-page {
      padding: 1rem;
    }

    .page-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .filters {
      flex-direction: column;
    }

    .task-title {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }

    .badges {
      justify-content: flex-start;
    }

    .meta-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }
  }
</style>