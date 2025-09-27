/**
 * Dashboard Page Component
 * Provides overview of projects, goals, tasks, and metrics
 */
class DashboardPage {
  constructor(container) {
    this.container = container;
    this.data = {
      projects: [],
      goals: [],
      tasks: [],
      recentActivity: []
    };
    this.widgets = new Map();
  }

  async render() {
    this.container.innerHTML = `
      <div class="dashboard-page">
        <div class="dashboard-header">
          <h1>Dashboard</h1>
          <div class="dashboard-actions">
            <button class="btn btn-primary" data-route="/projects/new">
              <span>+</span> New Project
            </button>
            <button class="btn btn-secondary" onclick="this.refreshData()">
              <span>↻</span> Refresh
            </button>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="dashboard-widget stats-widget">
            <h3>Overview</h3>
            <div id="stats-content" class="widget-content">
              <div class="loading-spinner">Loading...</div>
            </div>
          </div>

          <div class="dashboard-widget recent-activity-widget">
            <h3>Recent Activity</h3>
            <div id="activity-content" class="widget-content">
              <div class="loading-spinner">Loading...</div>
            </div>
          </div>

          <div class="dashboard-widget projects-widget">
            <h3>Active Projects</h3>
            <div id="projects-content" class="widget-content">
              <div class="loading-spinner">Loading...</div>
            </div>
          </div>

          <div class="dashboard-widget tasks-widget">
            <h3>Upcoming Tasks</h3>
            <div id="tasks-content" class="widget-content">
              <div class="loading-spinner">Loading...</div>
            </div>
          </div>

          <div class="dashboard-widget goals-widget">
            <h3>Goals Progress</h3>
            <div id="goals-content" class="widget-content">
              <div class="loading-spinner">Loading...</div>
            </div>
          </div>

          <div class="dashboard-widget calendar-widget">
            <h3>Calendar</h3>
            <div id="calendar-content" class="widget-content">
              <div class="loading-spinner">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.loadStyles();
    await this.loadData();
    this.renderWidgets();
  }

  loadStyles() {
    if (document.getElementById('dashboard-styles')) return;

    const dashboardPageStyles = `
      .dashboard-page {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
      }

      .dashboard-header h1 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
      }

      .dashboard-actions {
        display: flex;
        gap: 12px;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 24px;
      }

      .dashboard-widget {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }

      .dashboard-widget:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      .dashboard-widget h3 {
        margin: 0 0 16px 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .widget-content {
        min-height: 200px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .stat-item {
        text-align: center;
        padding: 16px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--glass-primary);
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 12px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .activity-list {
        max-height: 300px;
        overflow-y: auto;
      }

      .activity-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .activity-item:last-child {
        border-bottom: none;
      }

      .activity-icon {
        width: 32px;
        height: 32px;
        background: var(--glass-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
      }

      .activity-content {
        flex: 1;
        min-width: 0;
      }

      .activity-title {
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 2px;
      }

      .activity-meta {
        font-size: 12px;
        color: var(--text-secondary);
      }

      .project-list,
      .task-list,
      .goal-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .project-item,
      .task-item,
      .goal-item {
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .project-item:hover,
      .task-item:hover,
      .goal-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-1px);
      }

      .item-title {
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 4px;
      }

      .item-meta {
        font-size: 12px;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .progress-bar {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        margin-top: 8px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: var(--glass-primary);
        border-radius: 2px;
        transition: width 0.3s ease;
      }

      .mini-calendar {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 16px;
        text-align: center;
      }

      .calendar-month {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 12px;
      }

      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
        font-size: 12px;
      }

      .calendar-day {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        color: var(--text-secondary);
      }

      .calendar-day.today {
        background: var(--glass-primary);
        color: white;
      }

      .calendar-day.has-events {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .loading-spinner {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100px;
        color: var(--text-secondary);
      }

      @media (max-width: 768px) {
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
        
        .dashboard-header {
          flex-direction: column;
          gap: 16px;
          align-items: stretch;
        }
        
        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
    `;

    // Use StyleLoader if available, otherwise fallback to direct injection
    if (window.StyleLoader) {
      window.StyleLoader.injectStyles('dashboard-styles', dashboardPageStyles);
    } else {
      // Fallback for when StyleLoader is not available
      if (!document.getElementById('dashboard-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'dashboard-styles';
        styleEl.textContent = dashboardPageStyles;
        document.head.appendChild(styleEl);
      }
    }
  }

  async loadData() {
    try {
      // Use the new GraphQL dashboard endpoint
      const dashboard = await window.apiClient.getDashboard();
      
      this.data = {
        projects: dashboard.recentProjects || [],
        goals: dashboard.upcomingGoals || [],
        tasks: dashboard.todayTasks || [],
        recentActivity: [],
        stats: dashboard.workspaceStats || {}
      };
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      if (window.errorHandler) {
        window.errorHandler.show('Failed to load dashboard data');
      }
    }
  }

  renderWidgets() {
    this.renderStatsWidget();
    this.renderActivityWidget();
    this.renderProjectsWidget();
    this.renderTasksWidget();
    this.renderGoalsWidget();
    this.renderCalendarWidget();
  }

  renderStatsWidget() {
    const container = document.getElementById('stats-content');
    const stats = this.data.stats;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${stats.totalProjects || 0}</div>
          <div class="stat-label">Projects</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.totalGoals || 0}</div>
          <div class="stat-label">Goals</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.totalTasks || 0}</div>
          <div class="stat-label">Tasks</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.completedTasks || 0}</div>
          <div class="stat-label">Completed</div>
        </div>
      </div>
    `;
  }

  renderActivityWidget() {
    const container = document.getElementById('activity-content');
    
    if (!this.data.recentActivity.length) {
      container.innerHTML = '<div class="empty-state">No recent activity</div>';
      return;
    }

    container.innerHTML = `
      <div class="activity-list">
        ${this.data.recentActivity.map(item => `
          <div class="activity-item">
            <div class="activity-icon">${this.getActivityIcon(item.type)}</div>
            <div class="activity-content">
              <div class="activity-title">${item.title}</div>
              <div class="activity-meta">${this.formatTime(item.timestamp)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderProjectsWidget() {
    const container = document.getElementById('projects-content');
    
    if (!this.data.projects.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div>No active projects</div>
          <button class="btn btn-primary" data-route="/projects/new">Create Project</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="project-list">
        ${this.data.projects.map(project => `
          <div class="project-item" onclick="router.navigate('/projects/${project.id}')">
            <div class="item-title">${project.title}</div>
            <div class="item-meta">
              <span>${project.status}</span>
              <span>•</span>
              <span>Updated ${this.formatTime(project.updatedAt)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderTasksWidget() {
    const container = document.getElementById('tasks-content');
    
    if (!this.data.tasks.length) {
      container.innerHTML = '<div class="empty-state">No upcoming tasks</div>';
      return;
    }

    container.innerHTML = `
      <div class="task-list">
        ${this.data.tasks.map(task => `
          <div class="task-item" onclick="router.navigate('/tasks/${task.id}')">
            <div class="item-title">${task.title}</div>
            <div class="item-meta">
              <span>${task.priority || 'normal'}</span>
              <span>•</span>
              <span>${task.status}</span>
              ${task.dueDate ? `<span>•</span><span>Due ${this.formatDate(task.dueDate)}</span>` : ''}
              ${task.project ? `<span>•</span><span>${task.project.title}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderGoalsWidget() {
    const container = document.getElementById('goals-content');
    
    if (!this.data.goals.length) {
      container.innerHTML = '<div class="empty-state">No goals set</div>';
      return;
    }

    container.innerHTML = `
      <div class="goal-list">
        ${this.data.goals.map(goal => `
          <div class="goal-item" onclick="router.navigate('/goals/${goal.id}')">
            <div class="item-title">${goal.title}</div>
            <div class="item-meta">
              <span>${goal.priority}</span>
              <span>•</span>
              <span>${goal.status}</span>
              ${goal.dueDate ? `<span>•</span><span>Due ${this.formatDate(goal.dueDate)}</span>` : ''}
              ${goal.project ? `<span>•</span><span>${goal.project.title}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderCalendarWidget() {
    const container = document.getElementById('calendar-content');
    const now = new Date();
    
    container.innerHTML = `
      <div class="mini-calendar">
        <div class="calendar-month">
          ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <div class="calendar-grid">
          ${this.generateCalendarDays(now)}
        </div>
      </div>
    `;
  }

  generateCalendarDays(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const today = new Date();
    
    let html = '';
    
    // Add day headers
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(day => {
      html += `<div class="calendar-day">${day}</div>`;
    });
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
      html += '<div class="calendar-day"></div>';
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dayDate = new Date(date.getFullYear(), date.getMonth(), day);
      const isToday = dayDate.toDateString() === today.toDateString();
      const hasEvents = this.hasEventsOnDate(dayDate);
      
      html += `
        <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}">
          ${day}
        </div>
      `;
    }
    
    return html;
  }

  hasEventsOnDate(date) {
    // Check if any tasks or goals have this date
    const dateStr = date.toDateString();
    return this.data.tasks.some(task => 
      task.dueDate && new Date(task.dueDate).toDateString() === dateStr
    ) || this.data.goals.some(goal => 
      goal.targetDate && new Date(goal.targetDate).toDateString() === dateStr
    );
  }

  calculateStats() {
    const totalProjects = this.data.projects.length;
    const totalGoals = this.data.goals.length;
    const totalTasks = this.data.tasks.length;
    
    const completedTasks = this.data.tasks.filter(task => task.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { totalProjects, totalGoals, totalTasks, completionRate };
  }

  getActivityIcon(type) {
    const icons = {
      'project_created': '📁',
      'goal_created': '🎯',
      'task_created': '✓',
      'task_completed': '✅',
      'project_updated': '📝',
      'goal_updated': '🎯',
      'task_updated': '📝'
    };
    return icons[type] || '📝';
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays === -1) return 'yesterday';
    if (diffDays > 0 && diffDays <= 7) return `in ${diffDays}d`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  async refreshData() {
    const refreshButton = document.querySelector('.dashboard-actions button[onclick*="refreshData"]');
    if (refreshButton) {
      refreshButton.disabled = true;
      refreshButton.innerHTML = '<span>↻</span> Refreshing...';
    }

    try {
      await this.loadData();
      this.renderWidgets();
    } finally {
      if (refreshButton) {
        refreshButton.disabled = false;
        refreshButton.innerHTML = '<span>↻</span> Refresh';
      }
    }
  }
}

// Make DashboardPage globally available
window.DashboardPage = DashboardPage;