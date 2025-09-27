/**
 * Application Configuration
 * Manages environment-based configuration for standalone frontend
 */
class AppConfig {
  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  loadConfig() {
    // Default configuration
    const defaults = {
      API_BASE_URL: 'http://localhost:8080/api/v1',
      API_TIMEOUT: 30000,
      APP_NAME: 'همة',
      APP_VERSION: '1.0.0',
      DEBUG: false,
      FEATURES: {
        REAL_TIME_UPDATES: true,
        OFFLINE_MODE: false,
        ANALYTICS: false,
        DARK_MODE: true,
        KEYBOARD_SHORTCUTS: true,
        GLOBAL_SEARCH: true,
        NOTIFICATIONS: true
      },
      UI: {
        THEME: 'glass',
        ANIMATION_DURATION: 300,
        DEFAULT_PAGE_SIZE: 20,
        MAX_RECENT_ITEMS: 10
      }
    };

    // Try to load from environment variables (for build-time configuration)
    if (typeof process !== 'undefined' && process.env) {
      return {
        ...defaults,
        API_BASE_URL: process.env.REACT_APP_API_BASE_URL || process.env.VUE_APP_API_BASE_URL || defaults.API_BASE_URL,
        API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || process.env.VUE_APP_API_TIMEOUT || defaults.API_TIMEOUT),
        DEBUG: process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG === 'true',
        ...this.parseFeatureFlags(process.env)
      };
    }

    // Try to load from window.ENV (for runtime configuration)
    if (typeof window !== 'undefined' && window.ENV) {
      return {
        ...defaults,
        ...window.ENV
      };
    }

    // Try to load from meta tags
    const metaConfig = this.loadFromMetaTags();
    if (Object.keys(metaConfig).length > 0) {
      return {
        ...defaults,
        ...metaConfig
      };
    }

    // Try to load from local storage (for user preferences)
    const savedConfig = this.loadFromStorage();
    
    // Merge with URL parameters for development
    const urlConfig = this.loadFromURL();

    return {
      ...defaults,
      ...savedConfig,
      ...urlConfig
    };
  }

  loadFromMetaTags() {
    const config = {};
    const metaTags = document.querySelectorAll('meta[name^="app-"]');
    
    metaTags.forEach(tag => {
      const key = tag.getAttribute('name').replace('app-', '').toUpperCase();
      const value = tag.getAttribute('content');
      config[key] = this.parseValue(value);
    });

    return config;
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('go-goal-config');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load config from storage:', error);
      return {};
    }
  }

  loadFromURL() {
    const config = {};
    const params = new URLSearchParams(window.location.search);
    
    // Allow overriding API URL via URL parameter (for development)
    if (params.get('api')) {
      config.API_BASE_URL = params.get('api');
    }
    
    if (params.get('debug')) {
      config.DEBUG = params.get('debug') === 'true';
    }

    return config;
  }

  parseFeatureFlags(env) {
    const features = {};
    Object.keys(env).forEach(key => {
      if (key.startsWith('REACT_APP_FEATURE_') || key.startsWith('VUE_APP_FEATURE_')) {
        const featureName = key.split('FEATURE_')[1];
        features[featureName] = env[key] === 'true';
      }
    });
    return { FEATURES: features };
  }

  parseValue(value) {
    // Try to parse as JSON first
    try {
      return JSON.parse(value);
    } catch {
      // If not JSON, try other types
      if (value === 'true') return true;
      if (value === 'false') return false;
      if (!isNaN(value) && !isNaN(parseFloat(value))) return parseFloat(value);
      return value;
    }
  }

  validateConfig() {
    // Validate required configuration
    if (!this.config.API_BASE_URL) {
      console.error('API_BASE_URL is required but not configured');
    }

    // Clean up API URL
    this.config.API_BASE_URL = this.config.API_BASE_URL.replace(/\/$/, '');

    // Validate API timeout
    if (this.config.API_TIMEOUT < 1000) {
      console.warn('API_TIMEOUT is too low, setting to 5000ms');
      this.config.API_TIMEOUT = 5000;
    }

    console.log('App Configuration:', this.config);
  }

  get(key, defaultValue = null) {
    return this.getNestedValue(this.config, key, defaultValue);
  }

  set(key, value) {
    this.setNestedValue(this.config, key, value);
    this.saveToStorage();
  }

  getNestedValue(obj, key, defaultValue) {
    const keys = key.split('.');
    let current = obj;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  }

  setNestedValue(obj, key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    let current = obj;
    
    for (const k of keys) {
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[lastKey] = value;
  }

  saveToStorage() {
    try {
      // Only save user preferences, not environment config
      const userConfig = {
        UI: this.config.UI,
        // Add other user-configurable options here
      };
      localStorage.setItem('go-goal-config', JSON.stringify(userConfig));
    } catch (error) {
      console.warn('Failed to save config to storage:', error);
    }
  }

  // Get API configuration
  getAPIConfig() {
    return {
      baseURL: this.config.API_BASE_URL,
      timeout: this.config.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': this.config.APP_VERSION
      }
    };
  }

  // Feature flag helpers
  isFeatureEnabled(feature) {
    return this.get(`FEATURES.${feature}`, false);
  }

  enableFeature(feature) {
    this.set(`FEATURES.${feature}`, true);
  }

  disableFeature(feature) {
    this.set(`FEATURES.${feature}`, false);
  }

  // Environment helpers
  isDevelopment() {
    return this.config.DEBUG || window.location.hostname === 'localhost';
  }

  isProduction() {
    return !this.isDevelopment();
  }

  // Theme helpers
  getTheme() {
    return this.get('UI.THEME', 'glass');
  }

  setTheme(theme) {
    this.set('UI.THEME', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Debug helpers
  log(...args) {
    if (this.config.DEBUG) {
      console.log('[GoGoal]', ...args);
    }
  }

  warn(...args) {
    if (this.config.DEBUG) {
      console.warn('[GoGoal]', ...args);
    }
  }

  error(...args) {
    console.error('[GoGoal]', ...args);
  }
}

// Create global config instance
const appConfig = new AppConfig();

// Make it globally available
window.appConfig = appConfig;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppConfig;
}

// Set initial theme
document.documentElement.setAttribute('data-theme', appConfig.getTheme());