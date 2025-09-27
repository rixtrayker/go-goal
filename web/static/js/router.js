/**
 * Simple SPA Router
 * Handles client-side routing for the application
 */
class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.basePath = '';
    this.container = null;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });

    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        const route = link.dataset.route;
        this.navigate(route);
      }
    });
  }

  setContainer(container) {
    this.container = container;
  }

  addRoute(path, handler, options = {}) {
    this.routes.set(path, {
      handler,
      title: options.title || '',
      guard: options.guard || null,
      meta: options.meta || {}
    });
  }

  navigate(path, replace = false) {
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    this.handleRoute(path);
  }

  async handleRoute(path) {
    // Clean up path
    path = path.replace(this.basePath, '') || '/';
    
    // Find matching route
    const route = this.findRoute(path);
    if (!route) {
      this.handle404(path);
      return;
    }

    // Check route guard
    if (route.guard && !await route.guard()) {
      return;
    }

    try {
      this.currentRoute = { path, ...route };
      
      // Update page title
      if (route.title) {
        document.title = route.title;
      }

      // Execute route handler
      await route.handler(this.extractParams(path, route.pattern), path);
      
    } catch (error) {
      console.error('Route handler error:', error);
      this.handleError(error, path);
    }
  }

  findRoute(path) {
    // Try exact match first
    if (this.routes.has(path)) {
      return { ...this.routes.get(path), pattern: path };
    }

    // Try pattern matching
    for (const [pattern, route] of this.routes) {
      if (this.matchPattern(path, pattern)) {
        return { ...route, pattern };
      }
    }

    return null;
  }

  matchPattern(path, pattern) {
    const pathParts = path.split('/').filter(p => p);
    const patternParts = pattern.split('/').filter(p => p);

    if (pathParts.length !== patternParts.length) {
      return false;
    }

    return patternParts.every((part, i) => {
      return part.startsWith(':') || part === pathParts[i];
    });
  }

  extractParams(path, pattern) {
    const pathParts = path.split('/').filter(p => p);
    const patternParts = pattern.split('/').filter(p => p);
    const params = {};

    patternParts.forEach((part, i) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);
        params[paramName] = pathParts[i];
      }
    });

    return params;
  }

  handle404(path) {
    if (this.container) {
      this.container.innerHTML = `
        <div class="error-page">
          <div class="error-code">404</div>
          <div class="error-message">Page not found</div>
          <div class="error-description">The page "${path}" could not be found.</div>
          <button class="btn btn-primary" onclick="router.navigate('/')">
            Go Home
          </button>
        </div>
      `;
    }
  }

  handleError(error, path) {
    if (this.container) {
      this.container.innerHTML = `
        <div class="error-page">
          <div class="error-code">500</div>
          <div class="error-message">Something went wrong</div>
          <div class="error-description">${error.message}</div>
          <button class="btn btn-primary" onclick="location.reload()">
            Reload Page
          </button>
        </div>
      `;
    }
  }

  start() {
    this.handleRoute(window.location.pathname);
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  buildUrl(route, params = {}) {
    let url = route;
    
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });

    return url;
  }
}

// Create global router instance
window.router = new Router();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Router;
}