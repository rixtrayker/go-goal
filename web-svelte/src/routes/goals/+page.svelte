<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import GoalForm from '$lib/components/forms/GoalForm.svelte';
  import type { Goal, Project } from '$lib/types/models';

  // Mock data
  let goals: Goal[] = [
    {
      id: '1',
      title: 'Launch Marketing Campaign',
      description: 'Complete social media marketing campaign for product launch',
      priority: 'high',
      dueDate: '2025-01-15T00:00:00Z',
      status: 'active',
      projectId: 1,
      flowId: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
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
      tasks: [],
      notes: [],
      tags: [],
      flow: null
    },
    {
      id: '2',
      title: 'Improve User Experience',
      description: 'Enhance the user interface and user experience of the mobile app',
      priority: 'medium',
      dueDate: '2025-02-01T00:00:00Z',
      status: 'active',
      projectId: 2,
      flowId: null,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
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
      tasks: [],
      notes: [],
      tags: [],
      flow: null
    },
    {
      id: '3',
      title: 'Update Documentation',
      description: 'Refresh all technical documentation to latest standards',
      priority: 'low',
      dueDate: null,
      status: 'completed',
      projectId: 3,
      flowId: null,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
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
      tasks: [],
      notes: [],
      tags: [],
      flow: null
    }
  ];

  let projects: Project[] = goals.map(g => g.project);

  // State
  let is_create_modal_open = $state(false);
  let is_edit_modal_open = $state(false);
  let selected_goal: Goal | null = $state(null);
  let filter_status = $state('all');
  let filter_priority = $state('all');

  // Computed
  let filtered_goals = $derived(
    goals.filter(goal => {
      const status_match = filter_status === 'all' || goal.status === filter_status;
      const priority_match = filter_priority === 'all' || goal.priority === filter_priority;
      return status_match && priority_match;
    })
  );

  function open_create_modal() {
    selected_goal = null;
    is_create_modal_open = true;
  }

  function open_edit_modal(goal: Goal) {
    selected_goal = goal;
    is_edit_modal_open = true;
  }

  function close_modals() {
    is_create_modal_open = false;
    is_edit_modal_open = false;
    selected_goal = null;
  }

  function handle_goal_submit(data: any) {
    console.log('Goal data:', data);
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
      case 'active':
        return 'rgb(34, 197, 94)';
      case 'completed':
        return 'rgb(107, 114, 128)';
      case 'paused':
        return 'rgb(245, 158, 11)';
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
  <title>Goals - Go Goal</title>
</svelte:head>

<div class="goals-page">
  <!-- Header -->
  <div class="page-header">
    <div>
      <h1>Goals</h1>
      <p>Track your goals and achieve your objectives</p>
    </div>
    <Button variant="primary" on_click={open_create_modal}>
      + New Goal
    </Button>
  </div>

  <!-- Filters -->
  <div class="filters">
    <div class="filter-group">
      <label for="status-filter">Status:</label>
      <select id="status-filter" bind:value={filter_status} class="filter-select">
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="paused">Paused</option>
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

  <!-- Goals Grid -->
  <div class="goals-grid">
    {#each filtered_goals as goal (goal.id)}
      <Card variant="elevated" on_click={() => open_edit_modal(goal)}>
        <div class="goal-card">
          <div class="goal-header">
            <h3>{goal.title}</h3>
            <div class="badges">
              <span 
                class="priority-badge" 
                style:background-color={get_priority_color(goal.priority)}
              >
                {goal.priority}
              </span>
              <span 
                class="status-badge" 
                style:background-color={get_status_color(goal.status)}
              >
                {goal.status}
              </span>
            </div>
          </div>
          
          <p class="goal-description">{goal.description}</p>
          
          <div class="goal-meta">
            <div class="meta-item">
              <strong>Project:</strong> {goal.project.title}
            </div>
            {#if goal.dueDate}
              <div class="meta-item due-date">
                <strong>Due:</strong> {new Date(goal.dueDate).toLocaleDateString()}
                <span class="days-left">({get_days_until_due(goal.dueDate)})</span>
              </div>
            {/if}
            <div class="meta-item">
              <strong>Created:</strong> {new Date(goal.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <div class="goal-progress">
            <div class="progress-header">
              <span>Progress</span>
              <span>0%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style:width="0%"></div>
            </div>
          </div>
        </div>
      </Card>
    {/each}
  </div>

  {#if filtered_goals.length === 0}
    <div class="empty-state">
      <h3>No goals found</h3>
      <p>Create your first goal to start tracking your objectives!</p>
      <Button variant="primary" on_click={open_create_modal}>
        + Create Goal
      </Button>
    </div>
  {/if}
</div>

<!-- Create Goal Modal -->
<Modal
  is_open={is_create_modal_open}
  title="Create New Goal"
  on_close={close_modals}
>
  <GoalForm
    projects={projects}
    on_submit={handle_goal_submit}
    on_cancel={close_modals}
  />
</Modal>

<!-- Edit Goal Modal -->
<Modal
  is_open={is_edit_modal_open}
  title="Edit Goal"
  on_close={close_modals}
>
  {#if selected_goal}
    <GoalForm
      goal={selected_goal}
      projects={projects}
      on_submit={handle_goal_submit}
      on_cancel={close_modals}
    />
  {/if}
</Modal>

<style>
  .goals-page {
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

  .goals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .goal-card {
    padding: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .goal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .goal-header h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: rgb(17, 24, 39);
    margin: 0;
    flex: 1;
    margin-right: 1rem;
  }

  .badges {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .priority-badge,
  .status-badge {
    color: white;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    text-transform: capitalize;
    text-align: center;
  }

  .goal-description {
    color: rgb(107, 114, 128);
    margin-bottom: 1rem;
    flex: 1;
    line-height: 1.5;
  }

  .goal-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .meta-item {
    font-size: 0.875rem;
    color: rgb(107, 114, 128);
  }

  .meta-item strong {
    color: rgb(55, 65, 81);
  }

  .due-date .days-left {
    font-size: 0.75rem;
    color: rgb(239, 68, 68);
    font-weight: 500;
  }

  .goal-progress {
    padding-top: 1rem;
    border-top: 1px solid rgba(229, 231, 235, 0.5);
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: rgb(107, 114, 128);
  }

  .progress-bar {
    height: 0.5rem;
    background: rgba(229, 231, 235, 0.8);
    border-radius: 0.25rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: rgb(59, 130, 246);
    transition: width 0.3s ease;
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
    .goals-page {
      padding: 1rem;
    }

    .page-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .goals-grid {
      grid-template-columns: 1fr;
    }

    .filters {
      flex-direction: column;
    }

    .goal-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .goal-header h3 {
      margin-right: 0;
    }

    .badges {
      flex-direction: row;
    }
  }
</style>