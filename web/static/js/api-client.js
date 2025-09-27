/**
 * GraphQL API Client for همة Project Management System
 * Provides a unified interface for all GraphQL operations with proper error handling
 */
class APIClient {
  constructor() {
    // Get configuration from appConfig
    const apiConfig = window.appConfig ? window.appConfig.getAPIConfig() : {
      baseURL: '/graphql',
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    };
    
    this.baseURL = apiConfig.baseURL || '/graphql';
    this.defaultHeaders = apiConfig.headers;
    this.requestTimeout = apiConfig.timeout;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    
    // Log configuration in debug mode
    if (window.appConfig?.isDevelopment()) {
      console.log('API Client initialized with config:', {
        baseURL: this.baseURL,
        timeout: this.requestTimeout
      });
    }
  }

  // Generic GraphQL request method with error handling and retries
  async request(query, variables = {}, operationName = null) {
    const requestBody = {
      query,
      variables,
      ...(operationName && { operationName })
    };

    let lastError;
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

        const response = await fetch(this.baseURL, {
          method: 'POST',
          headers: this.defaultHeaders,
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await this.handleAPIError(response, this.baseURL, 'POST');
          throw error;
        }

        const result = await response.json();

        // Handle GraphQL errors
        if (result.errors && result.errors.length > 0) {
          const error = new Error(result.errors[0].message);
          error.graphqlErrors = result.errors;
          throw error;
        }

        return result.data;

      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (error.name === 'AbortError' || 
            error.status === 401 || 
            error.status === 403 || 
            error.status === 404 ||
            error.graphqlErrors ||
            attempt === this.retryAttempts) {
          throw error;
        }

        // Wait before retry
        await this.delay(this.retryDelay * attempt);
      }
    }

    throw lastError;
  }

  async handleAPIError(response, url, method) {
    let errorDetails;
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = { message: response.statusText };
    }

    const error = new Error(errorDetails.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.statusText = response.statusText;
    error.url = url;
    error.method = method;
    error.details = errorDetails;

    return error;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // GraphQL query and mutation helpers
  async query(query, variables = {}) {
    return this.request(query, variables);
  }

  async mutate(mutation, variables = {}) {
    return this.request(mutation, variables);
  }

  // Projects API
  async getProjects(workspaceId = null) {
    const query = `
      query GetProjects($workspaceId: Int) {
        projects(workspaceId: $workspaceId) {
          id
          title
          description
          status
          workspaceId
          flowId
          createdAt
          updatedAt
        }
      }
    `;
    const result = await this.query(query, { workspaceId });
    return result.projects;
  }

  async getProject(id) {
    const query = `
      query GetProject($id: ID!) {
        project(id: $id) {
          id
          title
          description
          status
          workspaceId
          flowId
          createdAt
          updatedAt
          goals {
            id
            title
            status
            priority
            dueDate
          }
          tasks {
            id
            title
            status
            priority
            dueDate
          }
        }
      }
    `;
    const result = await this.query(query, { id: id.toString() });
    return result.project;
  }

  async createProject(data) {
    const mutation = `
      mutation CreateProject($input: CreateProjectInput!) {
        createProject(input: $input) {
          id
          title
          description
          status
          workspaceId
          flowId
          createdAt
          updatedAt
        }
      }
    `;
    const result = await this.mutate(mutation, { input: data });
    return result.createProject;
  }

  async updateProject(id, data) {
    const mutation = `
      mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
        updateProject(id: $id, input: $input) {
          id
          title
          description
          status
          workspaceId
          flowId
          createdAt
          updatedAt
        }
      }
    `;
    const result = await this.mutate(mutation, { id: id.toString(), input: data });
    return result.updateProject;
  }

  async deleteProject(id) {
    const mutation = `
      mutation DeleteProject($id: ID!) {
        deleteProject(id: $id)
      }
    `;
    const result = await this.mutate(mutation, { id: id.toString() });
    return result.deleteProject;
  }

  // Goals API
  async getGoals(projectId = null) {
    const query = `
      query GetGoals($projectId: Int) {
        goals(projectId: $projectId) {
          id
          title
          description
          priority
          dueDate
          status
          projectId
          flowId
          createdAt
          updatedAt
        }
      }
    `;
    const result = await this.query(query, { projectId });
    return result.goals;
  }

  async getGoal(id) {
    const query = `
      query GetGoal($id: ID!) {
        goal(id: $id) {
          id
          title
          description
          priority
          dueDate
          status
          projectId
          flowId
          createdAt
          updatedAt
          tasks {
            id
            title
            status
            priority
            dueDate
          }
          project {
            id
            title
            status
          }
        }
      }
    `;
    const result = await this.query(query, { id: id.toString() });
    return result.goal;
  }

  async createGoal(data) {
    const mutation = `
      mutation CreateGoal($input: CreateGoalInput!) {
        createGoal(input: $input) {
          id
          title
          description
          priority
          dueDate
          status
          projectId
          flowId
          createdAt
          updatedAt
        }
      }
    `;
    const result = await this.mutate(mutation, { input: data });
    return result.createGoal;
  }

  async updateGoal(id, data) {
    const mutation = `
      mutation UpdateGoal($id: ID!, $input: UpdateGoalInput!) {
        updateGoal(id: $id, input: $input) {
          id
          title
          description
          priority
          dueDate
          status
          projectId
          flowId
          createdAt
          updatedAt
        }
      }
    `;
    const result = await this.mutate(mutation, { id: id.toString(), input: data });
    return result.updateGoal;
  }

  async deleteGoal(id) {
    const mutation = `
      mutation DeleteGoal($id: ID!) {
        deleteGoal(id: $id)
      }
    `;
    const result = await this.mutate(mutation, { id: id.toString() });
    return result.deleteGoal;
  }

  // Tasks API
  async getTasks(filters = {}) {
    const { projectId, goalId, status } = filters;
    const query = `
      query GetTasks($projectId: Int, $goalId: Int, $status: String) {
        tasks(projectId: $projectId, goalId: $goalId, status: $status) {
          id
          title
          description
          status
          priority
          dueDate
          goalId
          projectId
          flowId
          createdAt
          updatedAt
        }
      }
    `;
    const result = await this.query(query, { projectId, goalId, status });
    return result.tasks;
  }

  async getTask(id) {
    const query = `
      query GetTask($id: ID!) {
        task(id: $id) {
          id
          title
          description
          status
          priority
          dueDate
          goalId
          projectId
          flowId
          createdAt
          updatedAt
          goal {
            id
            title
            status
          }
          project {
            id
            title
            status
          }
        }
      }
    `;
    const result = await this.query(query, { id: id.toString() });
    return result.task;
  }

  async createTask(data) {
    const mutation = `
      mutation CreateTask($input: CreateTaskInput!) {
        createTask(input: $input) {
          id
          title
          description
          status
          priority
          dueDate
          goalId
          projectId
          flowId
          createdAt
          updatedAt
        }
      }
    `;
    const result = await this.mutate(mutation, { input: data });
    return result.createTask;
  }

  async updateTask(id, data) {
    const mutation = `
      mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
        updateTask(id: $id, input: $input) {
          id
          title
          description
          status
          priority
          dueDate
          goalId
          projectId
          flowId
          createdAt
          updatedAt
        }
      }
    `;
    const result = await this.mutate(mutation, { id: id.toString(), input: data });
    return result.updateTask;
  }

  async deleteTask(id) {
    const mutation = `
      mutation DeleteTask($id: ID!) {
        deleteTask(id: $id)
      }
    `;
    const result = await this.mutate(mutation, { id: id.toString() });
    return result.deleteTask;
  }

  // Tags API
  async getTags(parentId = null) {
    const query = `
      query GetTags($parentId: Int) {
        tags(parentId: $parentId) {
          id
          name
          color
          parentId
          createdAt
        }
      }
    `;
    const result = await this.query(query, { parentId });
    return result.tags;
  }

  async getTag(id) {
    const query = `
      query GetTag($id: ID!) {
        tag(id: $id) {
          id
          name
          color
          parentId
          createdAt
        }
      }
    `;
    const result = await this.query(query, { id: id.toString() });
    return result.tag;
  }

  async createTag(data) {
    const mutation = `
      mutation CreateTag($input: CreateTagInput!) {
        createTag(input: $input) {
          id
          name
          color
          parentId
          createdAt
        }
      }
    `;
    const result = await this.mutate(mutation, { input: data });
    return result.createTag;
  }

  async updateTag(id, data) {
    const mutation = `
      mutation UpdateTag($id: ID!, $input: UpdateTagInput!) {
        updateTag(id: $id, input: $input) {
          id
          name
          color
          parentId
          createdAt
        }
      }
    `;
    const result = await this.mutate(mutation, { id: id.toString(), input: data });
    return result.updateTag;
  }

  async deleteTag(id) {
    const mutation = `
      mutation DeleteTag($id: ID!) {
        deleteTag(id: $id)
      }
    `;
    const result = await this.mutate(mutation, { id: id.toString() });
    return result.deleteTag;
  }

  // Dashboard API
  async getDashboard(workspaceId = null) {
    const query = `
      query GetDashboard($workspaceId: Int) {
        dashboard(workspaceId: $workspaceId) {
          todayTasks {
            id
            title
            status
            priority
            dueDate
            project {
              id
              title
            }
          }
          recentProjects {
            id
            title
            status
            updatedAt
          }
          upcomingGoals {
            id
            title
            priority
            dueDate
            status
            project {
              id
              title
            }
          }
          workspaceStats {
            totalProjects
            totalGoals
            totalTasks
            completedTasks
            pendingTasks
          }
        }
      }
    `;
    const result = await this.query(query, { workspaceId });
    return result.dashboard;
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.query('{ __schema { types { name } } }');
      return { status: 'ok', schema: !!result };
    } catch (error) {
      throw new Error('Health check failed: ' + error.message);
    }
  }

  // Utility method for initialization
  async init() {
    try {
      await this.healthCheck();
      if (window.appConfig?.isDevelopment()) {
        console.log('API Client health check passed');
      }
    } catch (error) {
      console.warn('API Client initialization failed:', error);
      throw error;
    }
  }
}

// Create global API client instance
window.apiClient = new APIClient();

// Convenience wrapper functions with error handling
window.apiCall = async (fn, context = '', fallback = null) => {
  return window.errorHandler?.safeAsync(fn, `API Call: ${context}`, fallback) || fn();
};

// Helper functions for common operations
window.apiHelpers = {
  // Generic list with loading state
  async loadList(apiMethod, containerId, renderFn, context = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Show loading state
    container.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <span>Loading ${context}...</span>
      </div>
    `;

    try {
      const data = await apiMethod();
      if (Array.isArray(data) && data.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <div class="empty-title">No ${context} found</div>
            <div class="empty-description">There are no ${context} to display.</div>
          </div>
        `;
      } else {
        renderFn(data, container);
      }
    } catch (error) {
      container.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <div class="error-title">Failed to load ${context}</div>
          <div class="error-description">${error.message}</div>
          <button class="btn btn-primary" onclick="window.location.reload()">
            Try Again
          </button>
        </div>
      `;
      if (window.errorHandler) {
        window.errorHandler.handleError(error, `Loading ${context}`);
      }
    }
  },

  // Generic form submission
  async submitForm(formElement, apiMethod, successCallback, context = '') {
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData.entries());

    // Convert string values to appropriate types
    Object.keys(data).forEach(key => {
      if (data[key] === '') {
        data[key] = null;
      } else if (key.includes('Id') || key.includes('ID')) {
        const parsed = parseInt(data[key]);
        if (!isNaN(parsed)) {
          data[key] = parsed;
        }
      }
    });

    // Show loading state on submit button
    const submitBtn = formElement.querySelector('[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <div class="loading-spinner" style="width: 16px; height: 16px; margin-right: 8px;"></div>
        Saving...
      `;
    }

    try {
      const result = await apiMethod(data);
      if (successCallback) {
        successCallback(result);
      }
      
      // Show success notification
      if (window.errorHandler) {
        window.errorHandler.show(`${context} saved successfully`, 'success');
      }

    } catch (error) {
      if (window.errorHandler) {
        window.errorHandler.handleError(error, `Saving ${context}`);
      }
    } finally {
      // Restore submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  },

  // Generic delete confirmation
  async confirmDelete(itemName, deleteMethod, successCallback) {
    const confirmed = confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteMethod();
      if (successCallback) {
        successCallback();
      }
      
      if (window.errorHandler) {
        window.errorHandler.show(`${itemName} has been deleted`, 'success');
      }

    } catch (error) {
      if (window.errorHandler) {
        window.errorHandler.handleError(error, `Deleting ${itemName}`);
      }
    }
  }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIClient;
}