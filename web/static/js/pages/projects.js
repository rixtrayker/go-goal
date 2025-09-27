/**
 * Projects Page Component
 * Handles project listing, creation, editing, and viewing
 */
class ProjectsPage {
  constructor(container) {
    this.container = container;
    this.currentView = 'list';
    this.projects = [];
    this.filteredProjects = [];
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.sortBy = 'updated_at';
    this.sortOrder = 'desc';
  }

  async render(params = {}) {
    const { id, action } = params;

    if (id && action === 'edit') {
      await this.renderEditForm(id);
    } else if (id) {
      await this.renderProjectDetail(id);
    } else if (action === 'new') {
      await this.renderCreateForm();
    } else {
      await this.renderProjectsList();
    }
  }

  async renderProjectsList() {
    this.container.innerHTML = `
      <div class="projects-page">
        <div class="page-header">
          <div class="page-title">
            <h1>Projects</h1>
            <div class="page-subtitle">${this.projects.length} projects</div>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" data-route="/projects/new">
              <span>+</span> New Project
            </button>
          </div>
        </div>

        <div class="projects-controls">
          <div class="search-filters">
            <div class="search-box">
              <input type="text" 
                     class="search-input" 
                     placeholder="Search projects..." 
                     value="${this.searchTerm}"
                     oninput="this.closest('.projects-page').projectsPage.handleSearch(this.value)">
              <div class="search-icon">🔍</div>
            </div>

            <select class="filter-select" 
                    onchange="this.closest('.projects-page').projectsPage.handleStatusFilter(this.value)">
              <option value="all" ${this.filterStatus === 'all' ? 'selected' : ''}>All Status</option>
              <option value="active" ${this.filterStatus === 'active' ? 'selected' : ''}>Active</option>
              <option value="completed" ${this.filterStatus === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="on_hold" ${this.filterStatus === 'on_hold' ? 'selected' : ''}>On Hold</option>
              <option value="cancelled" ${this.filterStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>

            <select class="sort-select" 
                    onchange="this.closest('.projects-page').projectsPage.handleSort(this.value)">
              <option value="updated_at_desc" ${this.sortBy === 'updated_at' && this.sortOrder === 'desc' ? 'selected' : ''}>Recently Updated</option>
              <option value="created_at_desc" ${this.sortBy === 'created_at' && this.sortOrder === 'desc' ? 'selected' : ''}>Recently Created</option>
              <option value="title_asc" ${this.sortBy === 'title' && this.sortOrder === 'asc' ? 'selected' : ''}>Name A-Z</option>
              <option value="title_desc" ${this.sortBy === 'title' && this.sortOrder === 'desc' ? 'selected' : ''}>Name Z-A</option>
              <option value="progress_desc" ${this.sortBy === 'progress' && this.sortOrder === 'desc' ? 'selected' : ''}>Progress High-Low</option>
            </select>
          </div>

          <div class="view-switcher">
            <button class="view-btn ${this.currentView === 'list' ? 'active' : ''}" 
                    onclick="this.closest('.projects-page').projectsPage.switchView('list')">
              <span>☰</span> List
            </button>
            <button class="view-btn ${this.currentView === 'grid' ? 'active' : ''}" 
                    onclick="this.closest('.projects-page').projectsPage.switchView('grid')">
              <span>⊞</span> Grid
            </button>
            <button class="view-btn ${this.currentView === 'kanban' ? 'active' : ''}" 
                    onclick="this.closest('.projects-page').projectsPage.switchView('kanban')">
              <span>⚏</span> Kanban
            </button>
          </div>
        </div>

        <div id="projects-content" class="projects-content">
          <div class="loading-spinner">Loading projects...</div>
        </div>
      </div>
    `;

    this.loadStyles();
    this.container.querySelector('.projects-page').projectsPage = this;
    
    await this.loadProjects();
    this.renderProjectsContent();
  }

  async renderProjectDetail(id) {
    try {
      const project = await window.apiClient.getProject(id);
      const tasks = await window.apiClient.getTasks({ projectId: id });

      this.container.innerHTML = `
        <div class="project-detail-page">
          <div class="page-header">
            <div class="page-navigation">
              <button class="btn btn-ghost" onclick="router.navigate('/projects')">
                ← Back to Projects
              </button>
            </div>
            <div class="page-actions">
              <button class="btn btn-secondary" onclick="router.navigate('/projects/${id}/edit')">
                <span>✎</span> Edit
              </button>
              <button class="btn btn-danger" onclick="this.deleteProject('${id}')">
                <span>🗑</span> Delete
              </button>
            </div>
          </div>

          <div class="project-header">
            <div class="project-info">
              <h1 class="project-title">${project.title}</h1>
              <div class="project-meta">
                <span class="project-status status-${project.status}">${project.status}</span>
                <span>•</span>
                <span>Created ${this.formatDate(project.createdAt)}</span>
                <span>•</span>
                <span>Updated ${this.formatDate(project.updatedAt)}</span>
              </div>
              ${project.description ? `<div class="project-description">${project.description}</div>` : ''}
            </div>
            <div class="project-progress">
              <div class="progress-circle" style="--progress: ${project.progress || 0}">
                <span class="progress-text">${project.progress || 0}%</span>
              </div>
            </div>
          </div>

          <div class="project-content">
            <div class="project-tasks">
              <div class="section-header">
                <h3>Tasks (${tasks.length})</h3>
                <button class="btn btn-primary" onclick="this.createTask('${id}')">
                  <span>+</span> Add Task
                </button>
              </div>
              <div id="project-tasks-content">
                ${this.renderTasksList(tasks)}
              </div>
            </div>

            <div class="project-sidebar">
              <div class="project-details">
                <h4>Project Details</h4>
                <div class="detail-item">
                  <label>Start Date</label>
                  <span>${project.startDate ? this.formatDate(project.startDate) : 'Not set'}</span>
                </div>
                <div class="detail-item">
                  <label>End Date</label>
                  <span>${project.endDate ? this.formatDate(project.endDate) : 'Not set'}</span>
                </div>
                <div class="detail-item">
                  <label>Priority</label>
                  <span class="priority-${project.priority || 'medium'}">${project.priority || 'Medium'}</span>
                </div>
                <div class="detail-item">
                  <label>Tags</label>
                  <div class="tags-list">
                    ${(project.tags || []).map(tag => `
                      <span class="tag">${tag.name || tag}</span>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

    } catch (error) {
      this.container.innerHTML = `
        <div class="error-page">
          <h2>Project not found</h2>
          <p>The project you're looking for doesn't exist or has been deleted.</p>
          <button class="btn btn-primary" onclick="router.navigate('/projects')">
            Back to Projects
          </button>
        </div>
      `;
    }
  }

  async renderCreateForm() {
    this.container.innerHTML = `
      <div class="project-form-page">
        <div class="page-header">
          <div class="page-navigation">
            <button class="btn btn-ghost" onclick="router.navigate('/projects')">
              ← Back to Projects
            </button>
          </div>
          <div class="page-title">
            <h1>Create New Project</h1>
          </div>
        </div>

        <form id="project-form" class="project-form">
          <div class="form-section">
            <h3>Basic Information</h3>
            
            <div class="form-group">
              <label for="title">Project Title *</label>
              <input type="text" id="title" name="title" required 
                     placeholder="Enter project title">
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea id="description" name="description" rows="4" 
                        placeholder="Describe your project..."></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="status">Status</label>
                <select id="status" name="status">
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
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
                <label for="startDate">Start Date</label>
                <input type="date" id="startDate" name="startDate">
              </div>

              <div class="form-group">
                <label for="endDate">End Date</label>
                <input type="date" id="endDate" name="endDate">
              </div>
            </div>

            <div class="form-group">
              <label for="tags">Tags</label>
              <input type="text" id="tags" name="tags" 
                     placeholder="Enter tags separated by commas">
              <div class="form-help">Add tags to help organize and filter your projects</div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="router.navigate('/projects')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Create Project
            </button>
          </div>
        </form>
      </div>
    `;

    this.setupForm();
  }

  async renderEditForm(id) {
    try {
      const project = await window.apiClient.getProject(id);

      this.container.innerHTML = `
        <div class="project-form-page">
          <div class="page-header">
            <div class="page-navigation">
              <button class="btn btn-ghost" onclick="router.navigate('/projects/${id}')">
                ← Back to Project
              </button>
            </div>
            <div class="page-title">
              <h1>Edit Project</h1>
            </div>
          </div>

          <form id="project-form" class="project-form">
            <input type="hidden" name="id" value="${project.id}">
            
            <div class="form-section">
              <h3>Basic Information</h3>
              
              <div class="form-group">
                <label for="title">Project Title *</label>
                <input type="text" id="title" name="title" required 
                       value="${project.title}" placeholder="Enter project title">
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" name="description" rows="4" 
                          placeholder="Describe your project...">${project.description || ''}</textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="status">Status</label>
                  <select id="status" name="status">
                    <option value="active" ${project.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="on_hold" ${project.status === 'on_hold' ? 'selected' : ''}>On Hold</option>
                    <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${project.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="priority">Priority</label>
                  <select id="priority" name="priority">
                    <option value="low" ${project.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${project.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${project.priority === 'high' ? 'selected' : ''}>High</option>
                    <option value="urgent" ${project.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="startDate">Start Date</label>
                  <input type="date" id="startDate" name="startDate" 
                         value="${project.startDate ? project.startDate.split('T')[0] : ''}">
                </div>

                <div class="form-group">
                  <label for="endDate">End Date</label>
                  <input type="date" id="endDate" name="endDate" 
                         value="${project.endDate ? project.endDate.split('T')[0] : ''}">
                </div>
              </div>

              <div class="form-group">
                <label for="tags">Tags</label>
                <input type="text" id="tags" name="tags" 
                       value="${(project.tags || []).map(tag => tag.name || tag).join(', ')}"
                       placeholder="Enter tags separated by commas">
                <div class="form-help">Add tags to help organize and filter your projects</div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="router.navigate('/projects/${id}')">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Update Project
              </button>
            </div>
          </form>
        </div>
      `;

      this.setupForm(true);

    } catch (error) {
      this.container.innerHTML = `
        <div class="error-page">
          <h2>Project not found</h2>
          <p>The project you're trying to edit doesn't exist or has been deleted.</p>
          <button class="btn btn-primary" onclick="router.navigate('/projects')">
            Back to Projects
          </button>
        </div>
      `;
    }
  }

  setupForm(isEdit = false) {
    const form = document.getElementById('project-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const projectData = {
        title: formData.get('title'),
        description: formData.get('description'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        startDate: formData.get('startDate') || null,
        endDate: formData.get('endDate') || null,
        tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      try {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = isEdit ? 'Updating...' : 'Creating...';

        let project;
        if (isEdit) {
          const id = formData.get('id');
          project = await window.apiClient.updateProject(id, projectData);
          router.navigate(`/projects/${id}`);
        } else {
          project = await window.apiClient.createProject(projectData);
          router.navigate(`/projects/${project.id}`);
        }

        window.errorHandler.show(`Project ${isEdit ? 'updated' : 'created'} successfully!`, 'success');

      } catch (error) {
        console.error('Form submission error:', error);
        window.errorHandler.show(`Failed to ${isEdit ? 'update' : 'create'} project: ${error.message}`);
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = isEdit ? 'Update Project' : 'Create Project';
      }
    });
  }

  loadStyles() {
    if (document.getElementById('projects-page-styles')) return;

    const projectsPageStyles = `
      .projects-page {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
      }

      .page-title h1 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
      }

      .page-subtitle {
        color: var(--text-secondary);
        font-size: 14px;
        margin-top: 4px;
      }

      .projects-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        gap: 16px;
      }

      .search-filters {
        display: flex;
        gap: 12px;
        flex: 1;
      }

      .search-box {
        position: relative;
        flex: 1;
        max-width: 300px;
      }

      .search-input {
        width: 100%;
        padding: 10px 16px 10px 40px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
        font-size: 14px;
      }

      .search-input:focus {
        outline: none;
        border-color: var(--glass-primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary);
      }

      .filter-select,
      .sort-select {
        padding: 10px 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
        font-size: 14px;
        min-width: 150px;
      }

      .view-switcher {
        display: flex;
        gap: 4px;
        background: rgba(255, 255, 255, 0.05);
        padding: 4px;
        border-radius: 8px;
      }

      .view-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 13px;
      }

      .view-btn:hover,
      .view-btn.active {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .view-btn.active {
        background: var(--glass-primary);
        color: white;
      }

      .projects-content {
        min-height: 400px;
      }

      .projects-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }

      .project-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .project-card:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      .project-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      }

      .project-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .project-status {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-active { background: rgba(34, 197, 94, 0.2); color: #10b981; }
      .status-completed { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
      .status-on_hold { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
      .status-cancelled { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

      .project-description {
        color: var(--text-secondary);
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .project-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-secondary);
        font-size: 12px;
        margin-bottom: 16px;
      }

      .project-progress {
        margin-bottom: 12px;
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .progress-fill {
        height: 100%;
        background: var(--glass-primary);
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      .progress-text {
        font-size: 12px;
        color: var(--text-secondary);
      }

      .project-tags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .tag {
        background: rgba(99, 102, 241, 0.2);
        color: rgba(99, 102, 241, 1);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        border: 1px solid rgba(99, 102, 241, 0.3);
      }

      .loading-spinner {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: var(--text-secondary);
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-secondary);
      }

      .empty-state h3 {
        margin-bottom: 8px;
        color: var(--text-primary);
      }

      /* Project Detail Styles */
      .project-detail-page {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 24px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .project-info {
        flex: 1;
      }

      .project-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 12px 0;
      }

      .project-description {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-top: 16px;
      }

      .progress-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: conic-gradient(var(--glass-primary) calc(var(--progress) * 1%), rgba(255, 255, 255, 0.1) 0);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .progress-circle::before {
        content: '';
        position: absolute;
        width: 60px;
        height: 60px;
        background: var(--bg-primary);
        border-radius: 50%;
      }

      .progress-text {
        position: relative;
        z-index: 1;
        font-weight: 600;
        color: var(--text-primary);
      }

      .project-content {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 32px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .section-header h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .project-sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .project-details {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .project-details h4 {
        margin: 0 0 16px 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .detail-item:last-child {
        border-bottom: none;
      }

      .detail-item label {
        font-weight: 500;
        color: var(--text-secondary);
        font-size: 14px;
      }

      .detail-item span {
        color: var(--text-primary);
        font-size: 14px;
      }

      .priority-low { color: #10b981; }
      .priority-medium { color: #f59e0b; }
      .priority-high { color: #ef4444; }
      .priority-urgent { 
        color: #ef4444; 
        font-weight: 600;
        text-transform: uppercase;
      }

      .tags-list {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      /* Form Styles */
      .project-form-page {
        padding: 24px;
        max-width: 800px;
        margin: 0 auto;
      }

      .project-form {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 32px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .form-section {
        margin-bottom: 32px;
      }

      .form-section h3 {
        margin: 0 0 20px 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 600;
        color: var(--text-primary);
        font-size: 14px;
      }

      .form-group input,
      .form-group textarea,
      .form-group select {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
        font-size: 14px;
        font-family: inherit;
      }

      .form-group input:focus,
      .form-group textarea:focus,
      .form-group select:focus {
        outline: none;
        border-color: var(--glass-primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .form-help {
        color: var(--text-muted);
        font-size: 12px;
        margin-top: 4px;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding-top: 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      @media (max-width: 768px) {
        .projects-controls {
          flex-direction: column;
          align-items: stretch;
        }

        .search-filters {
          flex-direction: column;
        }

        .projects-grid {
          grid-template-columns: 1fr;
        }

        .project-content {
          grid-template-columns: 1fr;
          gap: 24px;
        }

        .form-row {
          grid-template-columns: 1fr;
        }
      }
    `;

    // Use StyleLoader if available, otherwise fallback to direct injection
    if (window.StyleLoader) {
      window.StyleLoader.injectStyles('projects-page-styles', projectsPageStyles);
    } else {
      // Fallback for when StyleLoader is not available
      if (!document.getElementById('projects-page-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'projects-page-styles';
        styleEl.textContent = projectsPageStyles;
        document.head.appendChild(styleEl);
      }
    }
  }

  async loadProjects() {
    try {
      this.projects = await window.apiClient.getProjects();
      this.applyFilters();
    } catch (error) {
      console.error('Failed to load projects:', error);
      window.errorHandler.show('Failed to load projects');
    }
  }

  applyFilters() {
    let filtered = [...this.projects];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(term) ||
        (project.description && project.description.toLowerCase().includes(term)) ||
        (project.tags && project.tags.some(tag => 
          (tag.name || tag).toLowerCase().includes(term)
        ))
      );
    }

    // Apply status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === this.filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[this.sortBy];
      let bVal = b[this.sortBy];

      if (this.sortBy === 'title') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (this.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    this.filteredProjects = filtered;
  }

  renderProjectsContent() {
    const container = document.getElementById('projects-content');

    if (this.filteredProjects.length === 0) {
      if (this.searchTerm || this.filterStatus !== 'all') {
        container.innerHTML = `
          <div class="empty-state">
            <h3>No projects found</h3>
            <p>Try adjusting your search or filter criteria.</p>
            <button class="btn btn-secondary" onclick="this.closest('.projects-page').projectsPage.clearFilters()">
              Clear Filters
            </button>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="empty-state">
            <h3>No projects yet</h3>
            <p>Create your first project to get started.</p>
            <button class="btn btn-primary" data-route="/projects/new">
              Create Project
            </button>
          </div>
        `;
      }
      return;
    }

    if (this.currentView === 'list') {
      container.innerHTML = `
        <div class="projects-list">
          ${this.filteredProjects.map(project => this.renderProjectCard(project, 'list')).join('')}
        </div>
      `;
    } else if (this.currentView === 'grid') {
      container.innerHTML = `
        <div class="projects-grid">
          ${this.filteredProjects.map(project => this.renderProjectCard(project, 'grid')).join('')}
        </div>
      `;
    } else if (this.currentView === 'kanban') {
      this.renderKanbanView(container);
    }
  }

  renderProjectCard(project, viewType) {
    return `
      <div class="project-card ${viewType}" onclick="router.navigate('/projects/${project.id}')">
        <div class="project-card-header">
          <h3 class="project-title">${project.title}</h3>
          <span class="project-status status-${project.status}">${project.status}</span>
        </div>
        
        ${project.description ? `
          <div class="project-description">${project.description}</div>
        ` : ''}
        
        <div class="project-meta">
          <span>Created ${this.formatDate(project.createdAt)}</span>
          <span>•</span>
          <span>Updated ${this.formatDate(project.updatedAt)}</span>
        </div>
        
        <div class="project-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
          </div>
          <div class="progress-text">${project.progress || 0}% complete</div>
        </div>
        
        ${project.tags && project.tags.length > 0 ? `
          <div class="project-tags">
            ${project.tags.slice(0, 3).map(tag => `
              <span class="tag">${tag.name || tag}</span>
            `).join('')}
            ${project.tags.length > 3 ? `<span class="tag">+${project.tags.length - 3}</span>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderKanbanView(container) {
    const statusGroups = {
      'active': [],
      'on_hold': [],
      'completed': [],
      'cancelled': []
    };

    this.filteredProjects.forEach(project => {
      if (statusGroups[project.status]) {
        statusGroups[project.status].push(project);
      }
    });

    const kanban = new KanbanView(container, {
      columns: [
        { id: 'active', title: 'Active', color: '#10b981' },
        { id: 'on_hold', title: 'On Hold', color: '#f59e0b' },
        { id: 'completed', title: 'Completed', color: '#6366f1' },
        { id: 'cancelled', title: 'Cancelled', color: '#ef4444' }
      ],
      allowAddColumn: false,
      allowEditColumn: false,
      allowDeleteColumn: false
    });

    const kanbanData = this.filteredProjects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      progress: project.progress,
      tags: project.tags,
      createdAt: project.createdAt
    }));

    kanban.setData(kanbanData);
  }

  renderTasksList(tasks) {
    if (!tasks.length) {
      return `
        <div class="empty-state">
          <p>No tasks in this project yet.</p>
        </div>
      `;
    }

    return `
      <div class="tasks-list">
        ${tasks.map(task => `
          <div class="task-item" onclick="router.navigate('/tasks/${task.id}')">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
              <span class="task-status status-${task.status}">${task.status}</span>
              ${task.priority ? `<span>•</span><span class="priority-${task.priority}">${task.priority}</span>` : ''}
              ${task.dueDate ? `<span>•</span><span>Due ${this.formatDate(task.dueDate)}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  handleSearch(value) {
    this.searchTerm = value;
    this.applyFilters();
    this.renderProjectsContent();
  }

  handleStatusFilter(value) {
    this.filterStatus = value;
    this.applyFilters();
    this.renderProjectsContent();
  }

  handleSort(value) {
    const [sortBy, sortOrder] = value.split('_');
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.applyFilters();
    this.renderProjectsContent();
  }

  switchView(view) {
    this.currentView = view;
    this.renderProjectsContent();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.sortBy = 'updated_at';
    this.sortOrder = 'desc';
    
    // Update UI controls
    this.container.querySelector('.search-input').value = '';
    this.container.querySelector('.filter-select').value = 'all';
    this.container.querySelector('.sort-select').value = 'updated_at_desc';
    
    this.applyFilters();
    this.renderProjectsContent();
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
}

// Make ProjectsPage globally available
window.ProjectsPage = ProjectsPage;