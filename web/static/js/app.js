/**
 * Main Application Controller
 * Manages the single-page application lifecycle, routing, and state
 */
class App {
  constructor() {
    this.currentPage = null;
    this.state = {
      user: null,
      settings: {},
      cache: new Map(),
      loading: false
    };
    
    this.mainContainer = null;
    this.initializeEventListeners();
  }

  async init() {
    try {
      appConfig.log('Initializing همة application...');
      
      // Show loading progress
      this.updateLoadingProgress(10, 'Loading configuration...');
      
      // Initialize components
      await this.initializeComponents();
      this.updateLoadingProgress(30, 'Connecting to API...');
      
      // Check API connectivity
      await this.checkAPIConnection();
      this.updateLoadingProgress(50, 'Loading user preferences...');
      
      // Load user settings
      await this.loadUserSettings();
      this.updateLoadingProgress(70, 'Setting up workspace...');
      
      // Initialize router and load initial page
      this.initializeRouter();
      this.updateLoadingProgress(90, 'Almost ready...');
      
      // Final setup
      await this.finalizeInitialization();
      this.updateLoadingProgress(100, 'Ready!');
      
      // Hide loader and show app
      setTimeout(() => this.hideLoader(), 500);
      
      appConfig.log('Application initialized successfully');
      
    } catch (error) {
      this.handleInitializationError(error);
    }
  }

  async initializeComponents() {
    // Initialize core components in order
    const components = [
      'config',
      'error-handler', 
      'api-client',
      'keyboard-shortcuts',
      'global-search'
    ];

    for (const component of components) {
      try {
        appConfig.log(`Initializing ${component}...`);
        
        switch (component) {
          case 'config':
            if (window.appConfig) {
              await window.appConfig.init();
            }
            break;
          case 'error-handler':
            if (window.errorHandler) {
              window.errorHandler.init();
            }
            break;
          case 'api-client':
            if (window.apiClient) {
              await window.apiClient.init();
            }
            break;
          case 'keyboard-shortcuts':
            if (window.keyboardShortcuts) {
              window.keyboardShortcuts.init();
            }
            break;
          case 'global-search':
            if (window.globalSearch) {
              window.globalSearch.init();
            }
            break;
        }
      } catch (error) {
        appConfig.warn(`Failed to initialize ${component}:`, error);
      }
    }
  }

  async checkAPIConnection() {
    try {
      await window.apiClient.healthCheck();
      appConfig.log('API connection established');
    } catch (error) {
      appConfig.warn('API connection failed, running in offline mode');
      this.state.offline = true;
    }
  }

  async loadUserSettings() {
    try {
      const settings = await window.apiClient.getSettings();
      this.state.settings = settings;
      appConfig.log('User settings loaded');
    } catch (error) {
      appConfig.warn('Failed to load user settings, using defaults');
      this.state.settings = {};
    }
  }

  initializeRouter() {
    // Get main content container
    this.mainContainer = document.getElementById('main-content');
    if (!this.mainContainer) {
      throw new Error('Main content container not found');
    }

    // Set up router
    window.router.setContainer(this.mainContainer);

    // Define routes
    this.setupRoutes();

    // Start router
    window.router.start();
  }

  setupRoutes() {
    // Dashboard
    window.router.addRoute('/', async () => {
      const dashboardPage = new DashboardPage(this.mainContainer);
      await dashboardPage.render();
    }, { title: 'Dashboard - همة' });

    // Projects routes
    window.router.addRoute('/projects', async () => {
      const projectsPage = new ProjectsPage(this.mainContainer);
      await projectsPage.render();
    }, { title: 'Projects - همة' });

    window.router.addRoute('/projects/new', async () => {
      const projectsPage = new ProjectsPage(this.mainContainer);
      await projectsPage.render({ action: 'new' });
    }, { title: 'New Project - همة' });

    window.router.addRoute('/projects/:id', async (params) => {
      const projectsPage = new ProjectsPage(this.mainContainer);
      await projectsPage.render({ id: params.id });
    }, { title: 'Project Details - همة' });

    window.router.addRoute('/projects/:id/edit', async (params) => {
      const projectsPage = new ProjectsPage(this.mainContainer);
      await projectsPage.render({ id: params.id, action: 'edit' });
    }, { title: 'Edit Project - همة' });

    // Tasks routes
    window.router.addRoute('/tasks', async () => {
      const tasksPage = new TasksPage(this.mainContainer);
      await tasksPage.render();
    }, { title: 'Tasks - همة' });

    window.router.addRoute('/tasks/new', async () => {
      const tasksPage = new TasksPage(this.mainContainer);
      await tasksPage.render({ action: 'new' });
    }, { title: 'New Task - همة' });

    window.router.addRoute('/tasks/:id', async (params) => {
      const tasksPage = new TasksPage(this.mainContainer);
      await tasksPage.render({ id: params.id });
    }, { title: 'Task Details - همة' });

    window.router.addRoute('/tasks/:id/edit', async (params) => {
      const tasksPage = new TasksPage(this.mainContainer);
      await tasksPage.render({ id: params.id, action: 'edit' });
    }, { title: 'Edit Task - همة' });

    // Goals routes (placeholder for future implementation)
    window.router.addRoute('/goals', async () => {
      this.mainContainer.innerHTML = `
        <div class="page-placeholder">
          <h1>Goals</h1>
          <p>Goals management coming soon!</p>
          <button class="btn btn-primary" onclick="router.navigate('/')">Back to Dashboard</button>
        </div>
      `;
    }, { title: 'Goals - همة' });

    // Contexts routes (placeholder for future implementation)
    window.router.addRoute('/contexts', async () => {
      this.mainContainer.innerHTML = `
        <div class="page-placeholder">
          <h1>Contexts</h1>
          <p>Context management coming soon!</p>
          <button class="btn btn-primary" onclick="router.navigate('/')">Back to Dashboard</button>
        </div>
      `;
    }, { title: 'Contexts - همة' });

    // Tags routes
    window.router.addRoute('/tags', async () => {
      const tagsPage = new TagsPage(this.mainContainer);
      await tagsPage.render();
    }, { title: 'Tags - همة' });

    window.router.addRoute('/tags/new', async () => {
      const tagsPage = new TagsPage(this.mainContainer);
      await tagsPage.render({ action: 'new' });
    }, { title: 'New Tag - همة' });

    window.router.addRoute('/tags/:id/edit', async (params) => {
      const tagsPage = new TagsPage(this.mainContainer);
      await tagsPage.render({ id: params.id, action: 'edit' });
    }, { title: 'Edit Tag - همة' });

    // Notes routes (placeholder for future implementation)
    window.router.addRoute('/notes', async () => {
      this.mainContainer.innerHTML = `
        <div class="page-placeholder">
          <h1>Notes</h1>
          <p>Note management coming soon!</p>
          <button class="btn btn-primary" onclick="router.navigate('/')">Back to Dashboard</button>
        </div>
      `;
    }, { title: 'Notes - همة' });

    // Settings routes (placeholder for future implementation)
    window.router.addRoute('/settings', async () => {
      this.mainContainer.innerHTML = `
        <div class="page-placeholder">
          <h1>Settings</h1>
          <p>Settings page coming soon!</p>
          <button class="btn btn-primary" onclick="router.navigate('/')">Back to Dashboard</button>
        </div>
      `;
    }, { title: 'Settings - همة' });

    appConfig.log('Routes configured');
  }

  async finalizeInitialization() {
    // Set up periodic tasks
    this.setupPeriodicTasks();
    
    // Initialize service worker (if available)
    if ('serviceWorker' in navigator && appConfig.isFeatureEnabled('OFFLINE_MODE')) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        appConfig.log('Service worker registered');
      } catch (error) {
        appConfig.warn('Service worker registration failed:', error);
      }
    }
    
    // Set up real-time updates (if enabled)
    if (appConfig.isFeatureEnabled('REAL_TIME_UPDATES')) {
      this.setupRealTimeUpdates();
    }

    // Update navigation based on current route
    this.updateNavigation();
  }

  handleInitializationError(error) {
    console.error('Application initialization failed:', error);
    
    // Show error state
    document.getElementById('app-loader').innerHTML = `
      <div class="loader-content glass">
        <div class="loader-icon">⚠️</div>
        <div class="loader-title">Initialization Failed</div>
        <div class="loader-subtitle">${error.message}</div>
        <button class="btn btn-primary" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    `;
    
    window.errorHandler?.handleError(error, 'Application initialization');
  }

  updateLoadingProgress(percentage, message) {
    const progressBar = document.getElementById('loader-progress');
    const subtitle = document.querySelector('.loader-subtitle');
    
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    
    if (subtitle) {
      subtitle.textContent = message;
    }
  }

  hideLoader() {
    const loader = document.getElementById('app-loader');
    const app = document.getElementById('app');
    
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
        if (app) {
          app.style.display = 'block';
          setTimeout(() => {
            app.classList.add('loaded');
            document.body.classList.remove('loading');
          }, 100);
        }
      }, 300);
    }
  }

  initializeEventListeners() {
    // Listen for navigation clicks
    document.addEventListener('click', (e) => {
      const navLink = e.target.closest('[data-route]');
      if (navLink) {
        e.preventDefault();
        const route = navLink.dataset.route;
        window.router.navigate(route);
        this.updateNavigation();
      }
    });

    // Keyboard shortcuts for navigation
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const routes = ['/', '/projects', '/tasks', '/goals', '/contexts', '/tags', '/notes', '/settings'];
        const routeIndex = parseInt(e.key) - 1;
        if (routes[routeIndex]) {
          window.router.navigate(routes[routeIndex]);
          this.updateNavigation();
        }
      }
    });

    // Listen for router events
    window.addEventListener('popstate', () => {
      this.updateNavigation();
    });
  }

  updateNavigation() {
    // Update active nav link based on current route
    const currentPath = window.location.pathname;
    
    document.querySelectorAll('.nav-link').forEach(link => {
      const route = link.dataset.route;
      let isActive = false;

      if (route === '/' && currentPath === '/') {
        isActive = true;
      } else if (route !== '/' && currentPath.startsWith(route)) {
        isActive = true;
      }

      link.classList.toggle('active', isActive);
    });
  }

  setupPeriodicTasks() {
    // Auto-save drafts every 30 seconds
    setInterval(() => {
      this.autoSaveDrafts();
    }, 30000);

    // Sync with server every 5 minutes
    setInterval(() => {
      this.syncWithServer();
    }, 300000);

    // Clean up cache every hour
    setInterval(() => {
      this.cleanupCache();
    }, 3600000);
  }

  setupRealTimeUpdates() {
    // WebSocket connection for real-time updates
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        appConfig.log('WebSocket connected');
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleRealTimeUpdate(data);
        } catch (error) {
          appConfig.warn('Invalid WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        appConfig.log('WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.setupRealTimeUpdates(), 5000);
      };

      this.websocket.onerror = (error) => {
        appConfig.warn('WebSocket error:', error);
      };
      
    } catch (error) {
      appConfig.warn('Failed to setup WebSocket:', error);
    }
  }

  handleRealTimeUpdate(data) {
    // Handle real-time updates from server
    switch (data.type) {
      case 'task_updated':
        this.handleTaskUpdate(data.payload);
        break;
      case 'project_updated':
        this.handleProjectUpdate(data.payload);
        break;
      case 'notification':
        this.showNotification(data.payload);
        break;
      default:
        appConfig.log('Unknown real-time update:', data);
    }
  }

  handleTaskUpdate(task) {
    // Update task in cache and refresh UI if needed
    this.state.cache.set(`task_${task.id}`, task);
    
    // Emit custom event for components to listen to
    document.dispatchEvent(new CustomEvent('task-updated', { detail: task }));
  }

  handleProjectUpdate(project) {
    // Update project in cache and refresh UI if needed
    this.state.cache.set(`project_${project.id}`, project);
    
    // Emit custom event for components to listen to
    document.dispatchEvent(new CustomEvent('project-updated', { detail: project }));
  }

  showNotification(notification) {
    // Show notification to user
    if (window.errorHandler) {
      window.errorHandler.show(notification.message, notification.type || 'info');
    }
  }

  async autoSaveDrafts() {
    // Auto-save any form drafts
    const forms = document.querySelectorAll('form[data-autosave]');
    
    for (const form of forms) {
      try {
        const formData = new FormData(form);
        const draftData = Object.fromEntries(formData.entries());
        const draftKey = `draft_${form.dataset.autosave}`;
        
        localStorage.setItem(draftKey, JSON.stringify(draftData));
      } catch (error) {
        appConfig.warn('Failed to auto-save draft:', error);
      }
    }
  }

  async syncWithServer() {
    // Sync cached data with server
    if (this.state.offline) {
      return; // Skip sync if offline
    }

    try {
      // Sync any pending changes
      await this.syncPendingChanges();
      
      // Update cache with latest data
      await this.refreshCache();
      
      appConfig.log('Sync completed');
    } catch (error) {
      appConfig.warn('Sync failed:', error);
    }
  }

  async syncPendingChanges() {
    // Upload any pending changes to server
    const pendingChanges = JSON.parse(localStorage.getItem('pending_changes') || '[]');
    
    for (const change of pendingChanges) {
      try {
        await window.apiClient.syncChange(change);
      } catch (error) {
        appConfig.warn('Failed to sync change:', error);
      }
    }
    
    // Clear pending changes after successful sync
    localStorage.removeItem('pending_changes');
  }

  async refreshCache() {
    // Refresh commonly used data in cache
    try {
      const [projects, tasks] = await Promise.all([
        window.apiClient.getProjects(),
        window.apiClient.getTasks()
      ]);
      
      // Update cache
      this.state.cache.set('projects', projects);
      this.state.cache.set('tasks', tasks);
      
    } catch (error) {
      appConfig.warn('Failed to refresh cache:', error);
    }
  }

  cleanupCache() {
    // Remove old cache entries
    const maxAge = 3600000; // 1 hour
    const now = Date.now();
    
    for (const [key, value] of this.state.cache.entries()) {
      if (value.timestamp && (now - value.timestamp) > maxAge) {
        this.state.cache.delete(key);
      }
    }
    
    appConfig.log('Cache cleanup completed');
  }

  // Public API
  setLoading(loading) {
    this.state.loading = loading;
    document.body.classList.toggle('app-loading', loading);
  }

  getState() {
    return { ...this.state };
  }

  updateState(updates) {
    Object.assign(this.state, updates);
    
    // Emit state change event
    document.dispatchEvent(new CustomEvent('app-state-changed', { 
      detail: { state: this.state, updates } 
    }));
  }

  trackPageView(page) {
    // Track page views for analytics
    if (appConfig.isFeatureEnabled('ANALYTICS')) {
      try {
        // Send to analytics service
        window.analytics?.track('page_view', { page });
      } catch (error) {
        appConfig.warn('Analytics tracking failed:', error);
      }
    }
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});

// Make App globally available
window.App = App;