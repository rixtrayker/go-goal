<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  
  // Mock data for demonstration
  let stats = {
    totalProjects: 12,
    activeGoals: 8,
    completedTasks: 45,
    pendingTasks: 23
  };

  let recentProjects = [
    { id: 1, title: 'Website Redesign', status: 'active', progress: 75 },
    { id: 2, title: 'Mobile App', status: 'active', progress: 40 },
    { id: 3, title: 'Documentation', status: 'completed', progress: 100 }
  ];

  let upcomingTasks = [
    { id: 1, title: 'Review design mockups', dueDate: '2024-12-31', priority: 'high' },
    { id: 2, title: 'Update user stories', dueDate: '2025-01-02', priority: 'medium' },
    { id: 3, title: 'Team standup meeting', dueDate: '2025-01-03', priority: 'low' }
  ];
</script>

<svelte:head>
  <title>Dashboard - Go Goal</title>
</svelte:head>

<div class="dashboard">
  <div class="dashboard-header">
    <h1>Dashboard</h1>
    <p>Welcome back! Here's your productivity overview.</p>
  </div>

  <!-- Stats Grid -->
  <div class="stats-grid">
    <Card>
      <div class="stat-card">
        <div class="stat-number">{stats.totalProjects}</div>
        <div class="stat-label">Total Projects</div>
      </div>
    </Card>
    
    <Card>
      <div class="stat-card">
        <div class="stat-number">{stats.activeGoals}</div>
        <div class="stat-label">Active Goals</div>
      </div>
    </Card>
    
    <Card>
      <div class="stat-card">
        <div class="stat-number">{stats.completedTasks}</div>
        <div class="stat-label">Completed Tasks</div>
      </div>
    </Card>
    
    <Card>
      <div class="stat-card">
        <div class="stat-number">{stats.pendingTasks}</div>
        <div class="stat-label">Pending Tasks</div>
      </div>
    </Card>
  </div>

  <!-- Content Grid -->
  <div class="content-grid">
    <!-- Recent Projects -->
    <Card title="Recent Projects">
      <div class="projects-list">
        {#each recentProjects as project}
          <div class="project-item">
            <div class="project-info">
              <h3>{project.title}</h3>
              <span class="status status--{project.status}">{project.status}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style:width="{project.progress}%"></div>
            </div>
            <span class="progress-text">{project.progress}%</span>
          </div>
        {/each}
      </div>
    </Card>

    <!-- Upcoming Tasks -->
    <Card title="Upcoming Tasks">
      <div class="tasks-list">
        {#each upcomingTasks as task}
          <div class="task-item">
            <div class="task-info">
              <h4>{task.title}</h4>
              <span class="due-date">Due: {task.dueDate}</span>
            </div>
            <span class="priority priority--{task.priority}">{task.priority}</span>
          </div>
        {/each}
      </div>
    </Card>
  </div>

  <!-- Quick Actions -->
  <div class="quick-actions">
    <h2>Quick Actions</h2>
    <div class="actions-grid">
      <Button variant="primary" on_click={() => {}}>
        + New Project
      </Button>
      <Button variant="secondary" on_click={() => {}}>
        + New Goal
      </Button>
      <Button variant="secondary" on_click={() => {}}>
        + New Task
      </Button>
      <Button variant="ghost" on_click={() => {}}>
        View Reports
      </Button>
    </div>
  </div>
</div>

<style>
  .dashboard {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-header {
    margin-bottom: 2rem;
  }

  .dashboard-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: rgb(17, 24, 39);
    margin: 0 0 0.5rem 0;
  }

  .dashboard-header p {
    color: rgb(107, 114, 128);
    margin: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    text-align: center;
    padding: 1rem;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: rgb(59, 130, 246);
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: rgb(107, 114, 128);
    font-weight: 500;
  }

  .content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .projects-list, .tasks-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .project-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: rgba(249, 250, 251, 0.5);
  }

  .project-info {
    flex: 1;
  }

  .project-info h3 {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .status {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: 500;
  }

  .status--active {
    background: rgba(34, 197, 94, 0.1);
    color: rgb(34, 197, 94);
  }

  .status--completed {
    background: rgba(107, 114, 128, 0.1);
    color: rgb(107, 114, 128);
  }

  .progress-bar {
    flex: 1;
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

  .progress-text {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgb(107, 114, 128);
    min-width: 2rem;
  }

  .task-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: rgba(249, 250, 251, 0.5);
  }

  .task-info h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .due-date {
    font-size: 0.75rem;
    color: rgb(107, 114, 128);
  }

  .priority {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: 500;
    text-transform: uppercase;
  }

  .priority--high {
    background: rgba(239, 68, 68, 0.1);
    color: rgb(239, 68, 68);
  }

  .priority--medium {
    background: rgba(245, 158, 11, 0.1);
    color: rgb(245, 158, 11);
  }

  .priority--low {
    background: rgba(34, 197, 94, 0.1);
    color: rgb(34, 197, 94);
  }

  .quick-actions {
    margin-top: 2rem;
  }

  .quick-actions h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: rgb(17, 24, 39);
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .dashboard {
      padding: 1rem;
    }
    
    .content-grid {
      grid-template-columns: 1fr;
    }
    
    .actions-grid {
      grid-template-columns: 1fr;
    }
  }
</style>