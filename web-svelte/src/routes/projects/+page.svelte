<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import ProjectForm from '$lib/components/forms/ProjectForm.svelte';
  import type { Project, Workspace } from '$lib/types/models';

  // Mock data
  let projects: Project[] = [
    {
      id: '1',
      title: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design',
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
    {
      id: '2', 
      title: 'Mobile App Development',
      description: 'Native iOS and Android app for customer engagement',
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
    {
      id: '3',
      title: 'Documentation Updates',
      description: 'Update all technical documentation and user guides',
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
    }
  ];

  let workspaces: Workspace[] = [
    {
      id: '1',
      name: 'Main Workspace',
      description: 'Primary workspace for all projects',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      projects: [],
      flows: []
    }
  ];

  // State
  let is_create_modal_open = $state(false);
  let is_edit_modal_open = $state(false);
  let selected_project: Project | null = $state(null);
  let filter_status = $state('all');

  // Computed
  let filtered_projects = $derived(
    filter_status === 'all' 
      ? projects 
      : projects.filter(p => p.status === filter_status)
  );

  function open_create_modal() {
    selected_project = null;
    is_create_modal_open = true;
  }

  function open_edit_modal(project: Project) {
    selected_project = project;
    is_edit_modal_open = true;
  }

  function close_modals() {
    is_create_modal_open = false;
    is_edit_modal_open = false;
    selected_project = null;
  }

  function handle_project_submit(data: any) {
    console.log('Project data:', data);
    // In real app, this would call API
    close_modals();
  }

  function get_status_color(status: string) {
    switch (status) {
      case 'active':
        return 'rgb(34, 197, 94)';
      case 'completed':
        return 'rgb(107, 114, 128)';
      case 'archived':
        return 'rgb(239, 68, 68)';
      default:
        return 'rgb(107, 114, 128)';
    }
  }
</script>

<svelte:head>
  <title>Projects - Go Goal</title>
</svelte:head>

<div class="projects-page">
  <!-- Header -->
  <div class="page-header">
    <div>
      <h1>Projects</h1>
      <p>Manage your projects and track their progress</p>
    </div>
    <Button variant="primary" on_click={open_create_modal}>
      + New Project
    </Button>
  </div>

  <!-- Filters -->
  <div class="filters">
    <div class="filter-group">
      <label for="status-filter">Filter by status:</label>
      <select id="status-filter" bind:value={filter_status} class="filter-select">
        <option value="all">All Projects</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="archived">Archived</option>
      </select>
    </div>
  </div>

  <!-- Projects Grid -->
  <div class="projects-grid">
    {#each filtered_projects as project (project.id)}
      <Card variant="elevated" on_click={() => open_edit_modal(project)}>
        <div class="project-card">
          <div class="project-header">
            <h3>{project.title}</h3>
            <span 
              class="status-badge" 
              style:background-color={get_status_color(project.status)}
            >
              {project.status}
            </span>
          </div>
          
          <p class="project-description">{project.description}</p>
          
          <div class="project-meta">
            <span class="meta-item">Created: {new Date(project.createdAt).toLocaleDateString()}</span>
            <span class="meta-item">Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
          
          <div class="project-stats">
            <div class="stat">
              <span class="stat-value">0</span>
              <span class="stat-label">Goals</span>
            </div>
            <div class="stat">
              <span class="stat-value">0</span>
              <span class="stat-label">Tasks</span>
            </div>
            <div class="stat">
              <span class="stat-value">0</span>
              <span class="stat-label">Notes</span>
            </div>
          </div>
        </div>
      </Card>
    {/each}
  </div>

  {#if filtered_projects.length === 0}
    <div class="empty-state">
      <h3>No projects found</h3>
      <p>Create your first project to get started!</p>
      <Button variant="primary" on_click={open_create_modal}>
        + Create Project
      </Button>
    </div>
  {/if}
</div>

<!-- Create Project Modal -->
<Modal
  is_open={is_create_modal_open}
  title="Create New Project"
  on_close={close_modals}
>
  <ProjectForm
    workspaces={workspaces}
    on_submit={handle_project_submit}
    on_cancel={close_modals}
  />
</Modal>

<!-- Edit Project Modal -->
<Modal
  is_open={is_edit_modal_open}
  title="Edit Project"
  on_close={close_modals}
>
  {#if selected_project}
    <ProjectForm
      project={selected_project}
      workspaces={workspaces}
      on_submit={handle_project_submit}
      on_cancel={close_modals}
    />
  {/if}
</Modal>

<style>
  .projects-page {
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

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .project-card {
    padding: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .project-header h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: rgb(17, 24, 39);
    margin: 0;
    flex: 1;
  }

  .status-badge {
    color: white;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    text-transform: capitalize;
  }

  .project-description {
    color: rgb(107, 114, 128);
    margin-bottom: 1rem;
    flex: 1;
    line-height: 1.5;
  }

  .project-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 1rem;
  }

  .meta-item {
    font-size: 0.75rem;
    color: rgb(156, 163, 175);
  }

  .project-stats {
    display: flex;
    justify-content: space-around;
    padding-top: 1rem;
    border-top: 1px solid rgba(229, 231, 235, 0.5);
  }

  .stat {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 1.25rem;
    font-weight: 600;
    color: rgb(59, 130, 246);
  }

  .stat-label {
    font-size: 0.75rem;
    color: rgb(107, 114, 128);
    text-transform: uppercase;
    letter-spacing: 0.05em;
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
    .projects-page {
      padding: 1rem;
    }

    .page-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .projects-grid {
      grid-template-columns: 1fr;
    }

    .filters {
      flex-direction: column;
    }
  }
</style>