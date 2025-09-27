/**
 * Tasks Page Component
 * Handles task listing, creation, editing, and viewing
 */
class TasksPage {
  constructor(container) {
    this.container = container;
    this.currentView = 'list';
    this.tasks = [];
    this.filteredTasks = [];
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.filterPriority = 'all';
    this.filterProject = 'all';
    this.sortBy = 'updated_at';
    this.sortOrder = 'desc';
    this.projects = [];
  }

  async render(params = {}) {
    const { id, action } = params;

    if (id && action === 'edit') {
      await this.renderEditForm(id);
    } else if (id) {
      await this.renderTaskDetail(id);
    } else if (action === 'new') {
      await this.renderCreateForm();
    } else {
      await this.renderTasksList();
    }
  }

  async renderTasksList() {
    this.container.innerHTML = `
      <div class="tasks-page">
        <div class="page-header">
          <div class="page-title">
            <h1>Tasks</h1>
            <div class="page-subtitle">${this.tasks.length} tasks</div>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" data-route="/tasks/new">
              <span>+</span> New Task
            </button>
          </div>
        </div>

        <div class="tasks-controls">
          <div class="search-filters">
            <div class="search-box">
              <input type="text" 
                     class="search-input" 
                     placeholder="Search tasks..." 
                     value="${this.searchTerm}"
                     oninput="this.closest('.tasks-page').tasksPage.handleSearch(this.value)">
              <div class="search-icon">🔍</div>
            </div>

            <select class="filter-select" 
                    onchange="this.closest('.tasks-page').tasksPage.handleStatusFilter(this.value)">
              <option value="all" ${this.filterStatus === 'all' ? 'selected' : ''}>All Status</option>
              <option value="pending" ${this.filterStatus === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="in_progress" ${this.filterStatus === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${this.filterStatus === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="cancelled" ${this.filterStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>

            <select class="filter-select" 
                    onchange="this.closest('.tasks-page').tasksPage.handlePriorityFilter(this.value)">
              <option value="all" ${this.filterPriority === 'all' ? 'selected' : ''}>All Priorities</option>
              <option value="low" ${this.filterPriority === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${this.filterPriority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="high" ${this.filterPriority === 'high' ? 'selected' : ''}>High</option>
              <option value="urgent" ${this.filterPriority === 'urgent' ? 'selected' : ''}>Urgent</option>
            </select>

            <select class="filter-select" 
                    onchange="this.closest('.tasks-page').tasksPage.handleProjectFilter(this.value)">
              <option value="all" ${this.filterProject === 'all' ? 'selected' : ''}>All Projects</option>
              ${this.projects.map(project => `
                <option value="${project.id}" ${this.filterProject === project.id ? 'selected' : ''}>
                  ${project.title}
                </option>
              `).join('')}
            </select>

            <select class="sort-select" 
                    onchange="this.closest('.tasks-page').tasksPage.handleSort(this.value)">
              <option value="updated_at_desc" ${this.sortBy === 'updated_at' && this.sortOrder === 'desc' ? 'selected' : ''}>Recently Updated</option>
              <option value="created_at_desc" ${this.sortBy === 'created_at' && this.sortOrder === 'desc' ? 'selected' : ''}>Recently Created</option>
              <option value="due_date_asc" ${this.sortBy === 'due_date' && this.sortOrder === 'asc' ? 'selected' : ''}>Due Date (Soon)</option>
              <option value="priority_desc" ${this.sortBy === 'priority' && this.sortOrder === 'desc' ? 'selected' : ''}>Priority (High-Low)</option>
              <option value="title_asc" ${this.sortBy === 'title' && this.sortOrder === 'asc' ? 'selected' : ''}>Name A-Z</option>
            </select>
          </div>

          <div class="view-switcher">
            <button class="view-btn ${this.currentView === 'list' ? 'active' : ''}" 
                    onclick="this.closest('.tasks-page').tasksPage.switchView('list')">
              <span>☰</span> List
            </button>
            <button class="view-btn ${this.currentView === 'kanban' ? 'active' : ''}" 
                    onclick="this.closest('.tasks-page').tasksPage.switchView('kanban')">
              <span>⚏</span> Kanban
            </button>
            <button class="view-btn ${this.currentView === 'calendar' ? 'active' : ''}" 
                    onclick="this.closest('.tasks-page').tasksPage.switchView('calendar')">
              <span>📅</span> Calendar
            </button>
          </div>
        </div>

        <div id="tasks-content" class="tasks-content">
          <div class="loading-spinner">Loading tasks...</div>
        </div>
      </div>
    `;

    this.loadStyles();
    this.container.querySelector('.tasks-page').tasksPage = this;
    
    await this.loadData();
    this.renderTasksContent();
  }

  async renderTaskDetail(id) {
    try {
      const task = await window.apiClient.getTask(id);
      const project = task.projectId ? await window.apiClient.getProject(task.projectId) : null;
      const subtasks = await window.apiClient.getTasks({ parentId: id });

      this.container.innerHTML = `
        <div class="task-detail-page">
          <div class="page-header">
            <div class="page-navigation">
              <button class="btn btn-ghost" onclick="router.navigate('/tasks')">
                ← Back to Tasks
              </button>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary" onclick="router.navigate('/tasks/${id}/edit')">
                <span>✎</span> Edit
              </button>
              <button class="btn btn-danger" onclick="this.closest('.task-detail-page').tasksPage.deleteTask('${id}')">
                <span>🗑</span> Delete
              </button>
            </div>
          </div>

          <div class="task-header">
            <div class="task-info">
              <h1 class="task-title">${task.title}</h1>
              <div class="task-meta">
                <span class="task-status status-${task.status}">${task.status}</span>
                ${task.priority ? `<span>•</span><span class="priority-${task.priority}">${task.priority} priority</span>` : ''}
                ${project ? `<span>•</span><span>${project.title}</span>` : ''}
                <span>•</span>
                <span>Created ${this.formatDate(task.createdAt)}</span>
              </div>
              ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            </div>
            <div class="task-progress">
              <div class="progress-circle" style="--progress: ${task.progress || 0}">
                <span class="progress-text">${task.progress || 0}%</span>
              </div>
            </div>
          </div>

          <div class="task-content">
            <div class="task-main">
              ${subtasks.length > 0 ? `
                <div class="task-subtasks">
                  <div class="section-header">
                    <h3>Subtasks (${subtasks.length})</h3>
                    <button class="btn btn-primary" onclick="this.closest('.task-detail-page').tasksPage.createSubtask('${id}')">
                      <span>+</span> Add Subtask
                    </button>
                  </div>
                  <div class="subtasks-list">
                    ${subtasks.map(subtask => this.renderSubtask(subtask)).join('')}
                  </div>
                  <div class="subtasks-progress">
                    <div class="progress-info">
                      <span>Progress: ${Math.round((subtasks.filter(s => s.status === 'completed').length / subtasks.length) * 100)}%</span>
                      <span>${subtasks.filter(s => s.status === 'completed').length} of ${subtasks.length} completed</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${(subtasks.filter(s => s.status === 'completed').length / subtasks.length) * 100}%"></div>
                    </div>
                  </div>
                </div>
              ` : `
                <div class="task-subtasks">
                  <div class="section-header">
                    <h3>Subtasks</h3>
                    <button class="btn btn-primary" onclick="this.closest('.task-detail-page').tasksPage.createSubtask('${id}')">
                      <span>+</span> Add Subtask
                    </button>
                  </div>
                  <div class="empty-state">
                    <p>No subtasks yet. Break this task down into smaller steps.</p>
                    <button class="btn btn-secondary" onclick="this.closest('.task-detail-page').tasksPage.createSubtask('${id}')">
                      Create First Subtask
                    </button>
                  </div>
                </div>
              `}
            </div>

            <div class="task-sidebar">
              <div class="task-details">
                <h4>Task Details</h4>
                <div class="detail-item">
                  <label>Due Date</label>
                  <span>${task.dueDate ? this.formatDate(task.dueDate) : 'Not set'}</span>
                </div>
                <div class="detail-item">
                  <label>Estimated Time</label>
                  <span>${task.estimatedHours ? `${task.estimatedHours}h` : 'Not set'}</span>
                </div>
                <div class="detail-item">
                  <label>Actual Time</label>
                  <span>${task.actualHours ? `${task.actualHours}h` : 'Not logged'}</span>
                </div>
                <div class="detail-item">
                  <label>Assignee</label>
                  <span>${task.assignee || 'Unassigned'}</span>
                </div>
                <div class="detail-item">
                  <label>Tags</label>
                  <div class="tags-list">
                    ${(task.tags || []).map(tag => `
                      <span class="tag">${tag.name || tag}</span>
                    `).join('')}
                  </div>
                </div>
              </div>

              <div class="task-actions">
                <h4>Quick Actions</h4>
                <button class="action-btn" onclick="this.closest('.task-detail-page').tasksPage.toggleTaskStatus('${id}', '${task.status}')">
                  ${task.status === 'completed' ? '↶ Reopen Task' : '✓ Complete Task'}
                </button>
                <button class="action-btn" onclick="this.closest('.task-detail-page').tasksPage.duplicateTask('${id}')">
                  📋 Duplicate Task
                </button>
                <button class="action-btn" onclick="this.closest('.task-detail-page').tasksPage.archiveTask('${id}')">
                  📦 Archive Task
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Set up reference for event handlers
      this.container.querySelector('.task-detail-page').tasksPage = this;

    } catch (error) {
      this.container.innerHTML = `
        <div class="error-page">
          <h2>Task not found</h2>
          <p>The task you're looking for doesn't exist or has been deleted.</p>
          <button class="btn btn-primary" onclick="router.navigate('/tasks')">
            Back to Tasks
          </button>
        </div>
      `;
    }
  }

  async renderCreateForm() {
    await this.loadProjects();

    this.container.innerHTML = `
      <div class="task-form-page">
        <div class="page-header">
          <div class="page-navigation">
            <button class="btn btn-ghost" onclick="router.navigate('/tasks')">
              ← Back to Tasks
            </button>
          </div>
          <div class="page-title">
            <h1>Create New Task</h1>
          </div>
        </div>

        <form id="task-form" class="task-form">
          <div class="form-section">
            <h3>Basic Information</h3>
            
            <div class="form-group">
              <label for="title">Task Title *</label>
              <input type="text" id="title" name="title" required 
                     placeholder="Enter task title">
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea id="description" name="description" rows="4" 
                        placeholder="Describe what needs to be done..."></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="status">Status</label>
                <select id="status" name="status">
                  <option value="pending" selected>Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div class="form-group">
                <label for="priority">Priority</label>
                <select id="priority" name="priority">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="projectId">Project</label>
                <select id="projectId" name="projectId">
                  <option value="">No Project</option>
                  ${this.projects.map(project => `
                    <option value="${project.id}">${project.title}</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label for="parentId">Parent Task</label>
                <select id="parentId" name="parentId">
                  <option value="">No Parent (Main Task)</option>
                  ${this.tasks.filter(task => !task.parentId).map(task => `
                    <option value="${task.id}">${task.title}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="dueDate">Due Date</label>
                <input type="datetime-local" id="dueDate" name="dueDate">
              </div>

              <div class="form-group">
                <label for="estimatedHours">Estimated Hours</label>
                <input type="number" id="estimatedHours" name="estimatedHours" 
                       min="0" step="0.5" placeholder="0">
              </div>
            </div>

            <div class="form-group">
              <label for="assignee">Assignee</label>
              <input type="text" id="assignee" name="assignee" 
                     placeholder="Assign to someone">
            </div>

            <div class="form-group">
              <label for="tags">Tags</label>
              <div id="task-tags-input" data-tag-input='{"placeholder": "Add tags to organize your task...", "allowNew": true}'></div>
              <div class="form-help">Add tags to help organize and filter your tasks</div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="router.navigate('/tasks')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    `;

    this.setupForm();
  }

  async renderEditForm(id) {
    try {
      const task = await window.apiClient.getTask(id);
      this.currentTask = task; // Store for TagInput initialization
      await this.loadProjects();

      this.container.innerHTML = `
        <div class="task-form-page">
          <div class="page-header">
            <div class="page-navigation">
              <button class="btn btn-ghost" onclick="router.navigate('/tasks/${id}')">
                ← Back to Task
              </button>
            </div>
            <div class="page-title">
              <h1>Edit Task</h1>
            </div>
          </div>

          <form id="task-form" class="task-form">
            <input type="hidden" name="id" value="${task.id}">
            
            <div class="form-section">
              <h3>Basic Information</h3>
              
              <div class="form-group">
                <label for="title">Task Title *</label>
                <input type="text" id="title" name="title" required 
                       value="${task.title}" placeholder="Enter task title">
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" name="description" rows="4" 
                          placeholder="Describe what needs to be done...">${task.description || ''}</textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="status">Status</label>
                  <select id="status" name="status">
                    <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${task.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="priority">Priority</label>
                  <select id="priority" name="priority">
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                    <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="projectId">Project</label>
                  <select id="projectId" name="projectId">
                    <option value="">No Project</option>
                    ${this.projects.map(project => `
                      <option value="${project.id}" ${task.projectId == project.id ? 'selected' : ''}>
                        ${project.title}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label for="parentId">Parent Task</label>
                  <select id="parentId" name="parentId">
                    <option value="">No Parent (Main Task)</option>
                    ${this.tasks.filter(t => !t.parentId && t.id != task.id).map(t => `
                      <option value="${t.id}" ${task.parentId == t.id ? 'selected' : ''}>
                        ${t.title}
                      </option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="dueDate">Due Date</label>
                  <input type="datetime-local" id="dueDate" name="dueDate" 
                         value="${task.dueDate ? task.dueDate.slice(0, 16) : ''}">
                </div>

                <div class="form-group">
                  <label for="estimatedHours">Estimated Hours</label>
                  <input type="number" id="estimatedHours" name="estimatedHours" 
                         min="0" step="0.5" value="${task.estimatedHours || ''}" placeholder="0">
                </div>
              </div>

              <div class="form-group">
                <label for="assignee">Assignee</label>
                <input type="text" id="assignee" name="assignee" 
                       value="${task.assignee || ''}" placeholder="Assign to someone">
              </div>

              <div class="form-group">
                <label for="progress">Progress (%)</label>
                <input type="range" id="progress" name="progress" 
                       min="0" max="100" value="${task.progress || 0}"
                       oninput="this.nextElementSibling.textContent = this.value + '%'">
                <span class="progress-display">${task.progress || 0}%</span>
              </div>

              <div class="form-group">
                <label for="tags">Tags</label>
                <div id="task-tags-input" data-tag-input='{"placeholder": "Add tags to organize your task...", "allowNew": true}'></div>
                <div class="form-help">Add tags to help organize and filter your tasks</div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="router.navigate('/tasks/${id}')">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Update Task
              </button>
            </div>
          </form>
        </div>
      `;

      this.setupForm(true);

    } catch (error) {
      this.container.innerHTML = `
        <div class="error-page">
          <h2>Task not found</h2>
          <p>The task you're trying to edit doesn't exist or has been deleted.</p>
          <button class="btn btn-primary" onclick="router.navigate('/tasks')">
            Back to Tasks
          </button>
        </div>
      `;
    }
  }

  setupForm(isEdit = false) {
    const form = document.getElementById('task-form');
    
    // Initialize TagInput component
    const tagInputContainer = document.getElementById('task-tags-input');
    if (tagInputContainer) {
      this.tagInput = new TagInput(tagInputContainer, {
        placeholder: 'Add tags to organize your task...',
        allowNew: true
      });

      // If editing, set existing tags
      if (isEdit && this.currentTask && this.currentTask.tags) {
        this.tagInput.setValue(this.currentTask.tags);
      }
    }
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        projectId: formData.get('projectId') || null,
        parentId: formData.get('parentId') || null,
        dueDate: formData.get('dueDate') || null,
        estimatedHours: parseFloat(formData.get('estimatedHours')) || null,
        assignee: formData.get('assignee') || null,
        progress: parseInt(formData.get('progress')) || 0,
        tags: this.tagInput ? this.tagInput.getValue() : []
      };

      try {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = isEdit ? 'Updating...' : 'Creating...';

        let task;
        if (isEdit) {
          const id = formData.get('id');
          task = await window.apiClient.updateTask(id, taskData);
          router.navigate(`/tasks/${id}`);
        } else {
          task = await window.apiClient.createTask(taskData);
          router.navigate(`/tasks/${task.id}`);
        }

        window.errorHandler.show(`Task ${isEdit ? 'updated' : 'created'} successfully!`, 'success');

      } catch (error) {
        console.error('Form submission error:', error);
        window.errorHandler.show(`Failed to ${isEdit ? 'update' : 'create'} task: ${error.message}`);
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = isEdit ? 'Update Task' : 'Create Task';
      }
    });
  }

  loadStyles() {
    if (document.getElementById('tasks-page-styles')) return;

    const tasksPageStyles = `
      .tasks-page {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .tasks-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        gap: 16px;
        flex-wrap: wrap;
      }

      .search-filters {
        display: flex;
        gap: 12px;
        flex: 1;
        flex-wrap: wrap;
      }

      .tasks-content {
        min-height: 400px;
      }

      .tasks-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .task-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .task-card:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      .task-card-checkbox {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
      }

      .task-card-checkbox.completed {
        background: var(--glass-primary);
        border-color: var(--glass-primary);
      }

      .task-card-checkbox.completed::after {
        content: '✓';
        position: absolute;
        top: -2px;
        left: 3px;
        color: white;
        font-size: 14px;
        font-weight: bold;
      }

      .task-card-content {
        flex: 1;
        min-width: 0;
      }

      .task-card-title {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
        font-size: 15px;
      }

      .task-card-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--text-secondary);
        flex-wrap: wrap;
      }

      .task-card-badges {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .due-date-badge {
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }

      .due-date-badge.overdue {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }

      .due-date-badge.due-soon {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
      }

      .due-date-badge.normal {
        background: rgba(99, 102, 241, 0.2);
        color: #6366f1;
      }

      .progress-badge {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-secondary);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
      }

      .subtasks-badge {
        background: rgba(99, 102, 241, 0.2);
        color: #6366f1;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }

      .subtask-card {
        margin-left: 20px;
        border-left: 3px solid rgba(99, 102, 241, 0.3);
        background: rgba(99, 102, 241, 0.05);
      }

      .subtask-indent {
        width: 16px;
        height: 100%;
        border-left: 2px solid rgba(255, 255, 255, 0.1);
        margin-right: 8px;
      }

      /* Task Detail Styles */
      .task-detail-page {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 24px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .task-info {
        flex: 1;
      }

      .task-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 12px 0;
      }

      .task-description {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-top: 16px;
      }

      .task-content {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 32px;
      }

      .task-main {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .task-sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .task-details,
      .task-actions {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .task-details h4,
      .task-actions h4 {
        margin: 0 0 16px 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .action-btn {
        display: block;
        width: 100%;
        padding: 12px 16px;
        margin-bottom: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        text-align: left;
      }

      .action-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .subtasks-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .subtask-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.2s ease;
        margin-bottom: 8px;
      }

      .subtask-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .subtask-checkbox {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 3px;
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .subtask-checkbox.completed {
        background: var(--glass-primary);
        border-color: var(--glass-primary);
      }

      .subtask-checkbox.completed::after {
        content: '✓';
        position: absolute;
        top: -3px;
        left: 2px;
        color: white;
        font-size: 12px;
        font-weight: bold;
      }

      .subtask-title {
        flex: 1;
        color: var(--text-primary);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: 4px;
      }

      .subtask-title:hover {
        color: var(--glass-primary);
      }

      .subtask-meta {
        display: flex;
        gap: 8px;
        font-size: 12px;
        color: var(--text-secondary);
        flex-wrap: wrap;
      }

      .subtask-meta span {
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }

      .subtask-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
        margin-top: 2px;
      }

      .subtask-item:hover .subtask-actions {
        opacity: 1;
      }

      .subtask-action {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        cursor: pointer;
        color: var(--text-secondary);
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .subtask-action:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .subtasks-progress {
        margin-top: 16px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 12px;
        color: var(--text-secondary);
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--glass-primary), var(--glass-secondary));
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .section-header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      /* Form Styles */
      .task-form-page {
        padding: 24px;
        max-width: 800px;
        margin: 0 auto;
      }

      .task-form {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 32px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .progress-display {
        margin-left: 12px;
        font-weight: 600;
        color: var(--glass-primary);
      }

      input[type="range"] {
        width: 100%;
        margin: 8px 0;
      }

      @media (max-width: 768px) {
        .tasks-controls {
          flex-direction: column;
          align-items: stretch;
        }

        .search-filters {
          flex-direction: column;
        }

        .task-content {
          grid-template-columns: 1fr;
          gap: 24px;
        }

        .task-card {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }

        .task-card-content,
        .task-card-badges {
          width: 100%;
        }
      }
    `;

    // Use StyleLoader if available, otherwise fallback to direct injection
    if (window.StyleLoader) {
      window.StyleLoader.injectStyles('tasks-page-styles', tasksPageStyles);
    } else {
      // Fallback for when StyleLoader is not available
      if (!document.getElementById('tasks-page-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'tasks-page-styles';
        styleEl.textContent = tasksPageStyles;
        document.head.appendChild(styleEl);
      }
    }
  }

  async loadData() {
    try {
      const [tasks, projects] = await Promise.all([
        window.apiClient.getTasks(),
        window.apiClient.getProjects()
      ]);

      this.tasks = tasks;
      this.projects = projects;
      this.applyFilters();
    } catch (error) {
      console.error('Failed to load tasks:', error);
      window.errorHandler.show('Failed to load tasks');
    }
  }

  async loadProjects() {
    try {
      this.projects = await window.apiClient.getProjects();
    } catch (error) {
      console.error('Failed to load projects:', error);
      this.projects = [];
    }
  }

  applyFilters() {
    let filtered = [...this.tasks];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term)) ||
        (task.tags && task.tags.some(tag => 
          (tag.name || tag).toLowerCase().includes(term)
        ))
      );
    }

    // Apply filters
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === this.filterStatus);
    }

    if (this.filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === this.filterPriority);
    }

    if (this.filterProject !== 'all') {
      filtered = filtered.filter(task => task.projectId == this.filterProject);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[this.sortBy];
      let bVal = b[this.sortBy];

      if (this.sortBy === 'title') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      } else if (this.sortBy === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        aVal = priorityOrder[aVal] || 0;
        bVal = priorityOrder[bVal] || 0;
      }

      if (this.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    this.filteredTasks = filtered;
  }

  renderTasksContent() {
    const container = document.getElementById('tasks-content');

    if (this.filteredTasks.length === 0) {
      if (this.searchTerm || this.filterStatus !== 'all' || this.filterPriority !== 'all' || this.filterProject !== 'all') {
        container.innerHTML = `
          <div class="empty-state">
            <h3>No tasks found</h3>
            <p>Try adjusting your search or filter criteria.</p>
            <button class="btn btn-secondary" onclick="this.closest('.tasks-page').tasksPage.clearFilters()">
              Clear Filters
            </button>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="empty-state">
            <h3>No tasks yet</h3>
            <p>Create your first task to get started.</p>
            <button class="btn btn-primary" data-route="/tasks/new">
              Create Task
            </button>
          </div>
        `;
      }
      return;
    }

    if (this.currentView === 'list') {
      container.innerHTML = `
        <div class="tasks-list">
          ${this.filteredTasks.map(task => this.renderTaskCard(task)).join('')}
        </div>
      `;
    } else if (this.currentView === 'kanban') {
      this.renderKanbanView(container);
    } else if (this.currentView === 'calendar') {
      this.renderCalendarView(container);
    }
  }

  renderTaskCard(task) {
    const dueClass = this.getDueDateClass(task.dueDate);
    const project = this.projects.find(p => p.id == task.projectId);
    const parentTask = task.parentId ? this.tasks.find(t => t.id == task.parentId) : null;
    const subtasks = this.tasks.filter(t => t.parentId == task.id);
    const completedSubtasks = subtasks.filter(s => s.status === 'completed').length;

    return `
      <div class="task-card ${task.parentId ? 'subtask-card' : ''}" onclick="router.navigate('/tasks/${task.id}')">
        ${task.parentId ? '<div class="subtask-indent"></div>' : ''}
        
        <div class="task-card-checkbox ${task.status === 'completed' ? 'completed' : ''}" 
             onclick="event.stopPropagation(); this.closest('.tasks-page').tasksPage.toggleTask('${task.id}', '${task.status}')">
        </div>
        
        <div class="task-card-content">
          <div class="task-card-title">
            ${task.parentId ? '↳ ' : ''}${task.title}
          </div>
          <div class="task-card-meta">
            <span class="task-status status-${task.status}">${task.status}</span>
            ${task.priority ? `<span>•</span><span class="priority-${task.priority}">${task.priority}</span>` : ''}
            ${project ? `<span>•</span><span>${project.title}</span>` : ''}
            ${parentTask ? `<span>•</span><span>Subtask of ${parentTask.title}</span>` : ''}
            ${subtasks.length > 0 ? `<span>•</span><span>${completedSubtasks}/${subtasks.length} subtasks</span>` : ''}
            <span>•</span>
            <span>Updated ${this.formatDate(task.updatedAt)}</span>
          </div>
        </div>
        
        <div class="task-card-badges">
          ${task.dueDate ? `
            <div class="due-date-badge ${dueClass}">
              ${this.formatDueDate(task.dueDate)}
            </div>
          ` : ''}
          ${task.progress > 0 ? `
            <div class="progress-badge">${task.progress}%</div>
          ` : ''}
          ${subtasks.length > 0 ? `
            <div class="subtasks-badge">${subtasks.length} subtasks</div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderSubtask(subtask) {
    return `
      <div class="subtask-item">
        <div class="subtask-checkbox ${subtask.status === 'completed' ? 'completed' : ''}" 
             onclick="event.stopPropagation(); this.closest('.task-detail-page').tasksPage.toggleSubtask('${subtask.id}', '${subtask.status}')">
        </div>
        <div class="subtask-title" onclick="router.navigate('/tasks/${subtask.id}')">${subtask.title}</div>
        <div class="subtask-meta">
          ${subtask.priority ? `<span class="priority-${subtask.priority}">${subtask.priority}</span>` : ''}
          ${subtask.dueDate ? `<span>Due ${this.formatDueDate(subtask.dueDate)}</span>` : ''}
          ${subtask.progress > 0 ? `<span>${subtask.progress}%</span>` : ''}
        </div>
        <div class="subtask-actions">
          <div class="subtask-action" onclick="event.stopPropagation(); router.navigate('/tasks/${subtask.id}/edit')" title="Edit">
            ✎
          </div>
          <div class="subtask-action" onclick="event.stopPropagation(); this.closest('.task-detail-page').tasksPage.deleteSubtask('${subtask.id}')" title="Delete">
            ×
          </div>
        </div>
      </div>
    `;
  }

  renderKanbanView(container) {
    const kanban = new KanbanView(container, {
      columns: [
        { id: 'pending', title: 'To Do', color: '#f59e0b' },
        { id: 'in_progress', title: 'In Progress', color: '#3b82f6' },
        { id: 'completed', title: 'Done', color: '#10b981' }
      ],
      allowAddColumn: false,
      allowEditColumn: false,
      allowDeleteColumn: false
    });

    const kanbanData = this.filteredTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      progress: task.progress,
      tags: task.tags,
      assignee: task.assignee ? { name: task.assignee } : null
    }));

    kanban.setData(kanbanData);

    kanban.container.addEventListener('kanban-cardMoved', (e) => {
      const { cardId, newStatus } = e.detail;
      this.updateTaskStatus(cardId, newStatus);
    });
  }

  renderCalendarView(container) {
    const calendarTasks = this.filteredTasks
      .filter(task => task.dueDate)
      .map(task => ({
        id: task.id,
        title: task.title,
        date: task.dueDate,
        type: 'task',
        status: task.status,
        priority: task.priority
      }));

    const calendar = new CalendarView(container, {
      view: 'month',
      allowEventCreation: false,
      allowEventEditing: false
    });

    calendar.setData(calendarTasks);
  }

  getDueDateClass(dueDate) {
    if (!dueDate) return '';
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 2) return 'due-soon';
    return 'normal';
  }

  formatDueDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays <= 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Event handlers
  handleSearch(value) {
    this.searchTerm = value;
    this.applyFilters();
    this.renderTasksContent();
  }

  handleStatusFilter(value) {
    this.filterStatus = value;
    this.applyFilters();
    this.renderTasksContent();
  }

  handlePriorityFilter(value) {
    this.filterPriority = value;
    this.applyFilters();
    this.renderTasksContent();
  }

  handleProjectFilter(value) {
    this.filterProject = value;
    this.applyFilters();
    this.renderTasksContent();
  }

  handleSort(value) {
    const [sortBy, sortOrder] = value.split('_');
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.applyFilters();
    this.renderTasksContent();
  }

  switchView(view) {
    this.currentView = view;
    this.renderTasksContent();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.filterPriority = 'all';
    this.filterProject = 'all';
    this.sortBy = 'updated_at';
    this.sortOrder = 'desc';
    
    // Update UI controls
    this.container.querySelector('.search-input').value = '';
    this.container.querySelectorAll('select').forEach(select => {
      if (select.name) {
        select.value = 'all';
      }
    });
    this.container.querySelector('.sort-select').value = 'updated_at_desc';
    
    this.applyFilters();
    this.renderTasksContent();
  }

  async toggleTask(taskId, currentStatus) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await this.updateTaskStatus(taskId, newStatus);
  }

  async updateTaskStatus(taskId, status) {
    try {
      await window.apiClient.updateTask(taskId, { status });
      
      // Update local data
      const task = this.tasks.find(t => t.id == taskId);
      if (task) {
        task.status = status;
        this.applyFilters();
        this.renderTasksContent();
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      window.errorHandler.show('Failed to update task status');
    }
  }

  // Subtask Management Methods
  async createSubtask(parentId) {
    const title = prompt('Enter subtask title:');
    if (!title) return;

    try {
      const subtaskData = {
        title: title.trim(),
        parentId: parentId,
        status: 'pending',
        priority: 'medium'
      };

      const subtask = await window.apiClient.createTask(subtaskData);
      window.errorHandler.show('Subtask created successfully!', 'success');
      
      // Refresh the task detail view
      router.navigate(`/tasks/${parentId}`, { replace: true });
      
    } catch (error) {
      console.error('Failed to create subtask:', error);
      window.errorHandler.show('Failed to create subtask: ' + error.message);
    }
  }

  async toggleSubtask(subtaskId, currentStatus) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    try {
      await window.apiClient.updateTask(subtaskId, { status: newStatus });
      
      // Refresh current view
      const currentPath = window.location.pathname;
      const parentIdMatch = currentPath.match(/\/tasks\/(\d+)$/);
      if (parentIdMatch) {
        router.navigate(currentPath, { replace: true });
      }
      
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
      window.errorHandler.show('Failed to update subtask');
    }
  }

  async deleteSubtask(subtaskId) {
    if (!confirm('Are you sure you want to delete this subtask?')) return;
    
    try {
      await window.apiClient.deleteTask(subtaskId);
      window.errorHandler.show('Subtask deleted successfully!', 'success');
      
      // Refresh current view
      const currentPath = window.location.pathname;
      const parentIdMatch = currentPath.match(/\/tasks\/(\d+)$/);
      if (parentIdMatch) {
        router.navigate(currentPath, { replace: true });
      }
      
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      window.errorHandler.show('Failed to delete subtask: ' + error.message);
    }
  }

  async duplicateTask(taskId) {
    if (!confirm('Duplicate this task and all its subtasks?')) return;
    
    try {
      const task = await window.apiClient.getTask(taskId);
      const subtasks = await window.apiClient.getTasks({ parentId: taskId });
      
      // Create duplicate of main task
      const duplicateData = {
        title: `${task.title} (Copy)`,
        description: task.description,
        priority: task.priority,
        projectId: task.projectId,
        estimatedHours: task.estimatedHours,
        assignee: task.assignee,
        tags: task.tags,
        status: 'pending'
      };
      
      const duplicatedTask = await window.apiClient.createTask(duplicateData);
      
      // Create duplicates of all subtasks
      for (const subtask of subtasks) {
        const subtaskDuplicate = {
          title: subtask.title,
          description: subtask.description,
          priority: subtask.priority,
          parentId: duplicatedTask.id,
          estimatedHours: subtask.estimatedHours,
          assignee: subtask.assignee,
          tags: subtask.tags,
          status: 'pending'
        };
        await window.apiClient.createTask(subtaskDuplicate);
      }
      
      window.errorHandler.show('Task duplicated successfully!', 'success');
      router.navigate(`/tasks/${duplicatedTask.id}`);
      
    } catch (error) {
      console.error('Failed to duplicate task:', error);
      window.errorHandler.show('Failed to duplicate task: ' + error.message);
    }
  }

  async archiveTask(taskId) {
    if (!confirm('Archive this task? You can find it in archived tasks later.')) return;
    
    try {
      await window.apiClient.updateTask(taskId, { archived: true });
      window.errorHandler.show('Task archived successfully!', 'success');
      router.navigate('/tasks');
      
    } catch (error) {
      console.error('Failed to archive task:', error);
      window.errorHandler.show('Failed to archive task: ' + error.message);
    }
  }

  async deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;
    
    try {
      await window.apiClient.deleteTask(taskId);
      window.errorHandler.show('Task deleted successfully!', 'success');
      router.navigate('/tasks');
      
    } catch (error) {
      console.error('Failed to delete task:', error);
      window.errorHandler.show('Failed to delete task: ' + error.message);
    }
  }

  async toggleTaskStatus(taskId, currentStatus) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    try {
      await window.apiClient.updateTask(taskId, { status: newStatus });
      window.errorHandler.show(`Task marked as ${newStatus}!`, 'success');
      
      // Refresh current view
      const currentPath = window.location.pathname;
      router.navigate(currentPath, { replace: true });
      
    } catch (error) {
      console.error('Failed to toggle task status:', error);
      window.errorHandler.show('Failed to update task status');
    }
  }
}

// Make TasksPage globally available
window.TasksPage = TasksPage;