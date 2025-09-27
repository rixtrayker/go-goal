/**
 * Comprehensive Error Handling and Logging System
 * Provides centralized error management, logging, and user feedback
 */
class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.logToConsole = true;
    this.logToServer = false; // Can be enabled later
    this.showUserNotifications = true;
    
    this.init();
  }

  init() {
    // Global error handlers
    window.addEventListener('error', (event) => {
      this.handleGlobalError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleGlobalError({
        type: 'promise',
        message: 'Unhandled Promise Rejection',
        reason: event.reason,
        stack: event.reason?.stack
      });
    });

    // API error interceptor
    this.setupFetchInterceptor();
  }

  setupFetchInterceptor() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          const error = {
            type: 'api',
            status: response.status,
            statusText: response.statusText,
            url: args[0],
            method: args[1]?.method || 'GET'
          };
          
          // Try to get error details from response
          try {
            const errorData = await response.clone().json();
            error.details = errorData;
          } catch {
            error.details = await response.clone().text();
          }
          
          this.handleAPIError(error);
        }
        
        return response;
      } catch (fetchError) {
        this.handleAPIError({
          type: 'network',
          message: fetchError.message,
          url: args[0],
          method: args[1]?.method || 'GET',
          error: fetchError
        });
        throw fetchError;
      }
    };
  }

  handleGlobalError(errorInfo) {
    const error = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      level: 'error',
      ...errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logError(error);
    
    if (this.showUserNotifications) {
      this.showErrorNotification(error);
    }
  }

  handleAPIError(errorInfo) {
    const error = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      level: errorInfo.status >= 500 ? 'error' : 'warning',
      ...errorInfo
    };

    this.logError(error);
    
    if (this.showUserNotifications && error.level === 'error') {
      this.showAPIErrorNotification(error);
    }
  }

  // Wrapper for safe async operations
  async safeAsync(asyncFn, context = '', fallback = null) {
    try {
      return await asyncFn();
    } catch (error) {
      this.handleError(error, context);
      return fallback;
    }
  }

  // Wrapper for safe sync operations
  safe(fn, context = '', fallback = null) {
    try {
      return fn();
    } catch (error) {
      this.handleError(error, context);
      return fallback;
    }
  }

  handleError(error, context = '') {
    const errorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      level: 'error',
      type: 'handled',
      message: error.message || 'Unknown error',
      context,
      stack: error.stack,
      error: error
    };

    this.logError(errorInfo);
    
    if (this.showUserNotifications) {
      this.showErrorNotification(errorInfo);
    }
  }

  logError(error) {
    // Add to internal log
    this.errorLog.unshift(error);
    
    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console logging
    if (this.logToConsole) {
      const logMethod = error.level === 'warning' ? 'warn' : 'error';
      console.group(`🚨 ${error.type.toUpperCase()} ERROR [${error.id}]`);
      console[logMethod]('Message:', error.message);
      console.log('Context:', error.context || 'N/A');
      console.log('Timestamp:', error.timestamp);
      if (error.stack) {
        console.log('Stack:', error.stack);
      }
      if (error.details) {
        console.log('Details:', error.details);
      }
      console.groupEnd();
    }

    // Server logging (if enabled)
    if (this.logToServer) {
      this.sendErrorToServer(error);
    }

    // Update error badge
    this.updateErrorBadge();
  }

  async sendErrorToServer(error) {
    try {
      await fetch('/api/v1/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...error,
          // Remove circular references and large objects
          error: undefined,
          userAgent: navigator.userAgent,
          timestamp: error.timestamp
        })
      });
    } catch (serverError) {
      console.warn('Failed to send error to server:', serverError);
    }
  }

  showErrorNotification(error) {
    const notification = this.createNotification({
      type: 'error',
      title: 'Error Occurred',
      message: this.getUserFriendlyMessage(error),
      duration: 5000,
      actions: [
        {
          label: 'Details',
          action: () => this.showErrorDetails(error)
        },
        {
          label: 'Dismiss',
          action: () => notification.remove()
        }
      ]
    });
  }

  showAPIErrorNotification(error) {
    let message = 'An error occurred while communicating with the server.';
    
    if (error.status === 404) {
      message = 'The requested resource was not found.';
    } else if (error.status === 403) {
      message = 'You do not have permission to perform this action.';
    } else if (error.status === 401) {
      message = 'Your session has expired. Please refresh the page.';
    } else if (error.status >= 500) {
      message = 'Server error occurred. Please try again later.';
    }

    const notification = this.createNotification({
      type: 'error',
      title: `API Error (${error.status})`,
      message,
      duration: 7000,
      actions: [
        {
          label: 'Retry',
          action: () => {
            window.location.reload();
          }
        },
        {
          label: 'Details',
          action: () => this.showErrorDetails(error)
        }
      ]
    });
  }

  createNotification({ type, title, message, duration = 5000, actions = [] }) {
    const notification = document.createElement('div');
    notification.className = `error-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          ${type === 'error' ? '🚨' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </div>
        <div class="notification-body">
          <div class="notification-title">${title}</div>
          <div class="notification-message">${message}</div>
        </div>
        <div class="notification-actions">
          ${actions.map(action => `
            <button class="notification-action" data-action="${action.label}">
              ${action.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Add event listeners for actions
    actions.forEach(action => {
      const button = notification.querySelector(`[data-action="${action.label}"]`);
      if (button) {
        button.addEventListener('click', action.action);
      }
    });

    // Add to page
    let container = document.getElementById('error-notifications');
    if (!container) {
      container = document.createElement('div');
      container.id = 'error-notifications';
      container.className = 'error-notifications-container';
      document.body.appendChild(container);
    }
    
    container.appendChild(notification);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, duration);
    }

    return notification;
  }

  showErrorDetails(error) {
    const modal = document.createElement('div');
    modal.className = 'error-details-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="modal-content glass">
        <div class="modal-header">
          <h3>Error Details</h3>
          <button class="modal-close" onclick="this.closest('.error-details-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="error-detail-item">
            <label>Error ID:</label>
            <code>${error.id}</code>
          </div>
          <div class="error-detail-item">
            <label>Timestamp:</label>
            <span>${new Date(error.timestamp).toLocaleString()}</span>
          </div>
          <div class="error-detail-item">
            <label>Type:</label>
            <span>${error.type}</span>
          </div>
          <div class="error-detail-item">
            <label>Message:</label>
            <span>${error.message}</span>
          </div>
          ${error.context ? `
            <div class="error-detail-item">
              <label>Context:</label>
              <span>${error.context}</span>
            </div>
          ` : ''}
          ${error.url ? `
            <div class="error-detail-item">
              <label>URL:</label>
              <code>${error.url}</code>
            </div>
          ` : ''}
          ${error.stack ? `
            <div class="error-detail-item">
              <label>Stack Trace:</label>
              <pre><code>${error.stack}</code></pre>
            </div>
          ` : ''}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.error-details-modal').remove()">
            Close
          </button>
          <button class="btn btn-primary" onclick="errorHandler.copyErrorToClipboard('${error.id}')">
            Copy to Clipboard
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  copyErrorToClipboard(errorId) {
    const error = this.errorLog.find(e => e.id === errorId);
    if (error) {
      const errorText = JSON.stringify(error, null, 2);
      navigator.clipboard.writeText(errorText).then(() => {
        this.createNotification({
          type: 'success',
          title: 'Copied',
          message: 'Error details copied to clipboard',
          duration: 2000
        });
      });
    }
  }

  getErrorLog() {
    return [...this.errorLog];
  }

  clearErrorLog() {
    this.errorLog = [];
    this.updateErrorBadge();
  }

  updateErrorBadge() {
    const badge = document.getElementById('error-badge');
    const errorCount = this.errorLog.filter(e => e.level === 'error').length;
    
    if (badge) {
      if (errorCount > 0) {
        badge.textContent = errorCount;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  generateErrorId() {
    return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getUserFriendlyMessage(error) {
    // Convert technical errors to user-friendly messages
    const friendlyMessages = {
      'NetworkError': 'Network connection problem. Please check your internet connection.',
      'TypeError': 'A technical error occurred. Please refresh the page.',
      'ReferenceError': 'A technical error occurred. Please refresh the page.',
      'SyntaxError': 'A technical error occurred. Please refresh the page.',
      'Failed to fetch': 'Could not connect to the server. Please check your connection.',
    };

    for (const [key, message] of Object.entries(friendlyMessages)) {
      if (error.message?.includes(key)) {
        return message;
      }
    }

    return error.message || 'An unexpected error occurred.';
  }

  // Debug helpers
  showErrorConsole() {
    console.group('🔍 ERROR CONSOLE');
    console.log('Recent Errors:', this.errorLog.slice(0, 10));
    console.log('Error Count:', this.errorLog.length);
    console.log('Error Levels:', this.getErrorStats());
    console.groupEnd();
  }

  getErrorStats() {
    const stats = { error: 0, warning: 0, info: 0 };
    this.errorLog.forEach(err => {
      stats[err.level] = (stats[err.level] || 0) + 1;
    });
    return stats;
  }
}

// Initialize global error handler
const errorHandler = new ErrorHandler();

// Make it globally available
window.errorHandler = errorHandler;

// Convenience methods
window.safeAsync = (fn, context, fallback) => errorHandler.safeAsync(fn, context, fallback);
window.safe = (fn, context, fallback) => errorHandler.safe(fn, context, fallback);

// Add CSS for error notifications
const errorCSS = `
.error-notifications-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 10001;
  max-width: 400px;
  pointer-events: none;
}

.error-notification {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  margin-bottom: 10px;
  padding: 16px;
  border-left: 4px solid #ef4444;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideInRight 0.3s ease;
  pointer-events: auto;
}

.error-notification.warning {
  border-left-color: #f59e0b;
}

.error-notification.success {
  border-left-color: #10b981;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notification-icon {
  font-size: 20px;
  line-height: 1;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
  font-size: 14px;
}

.notification-message {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  line-height: 1.4;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.notification-action {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-action:hover {
  background: rgba(255, 255, 255, 0.2);
}

.error-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10002;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.error-details-modal .modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.error-details-modal .modal-content {
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  border-radius: 16px;
}

.error-details-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.error-details-modal .modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.error-details-modal .modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.error-details-modal .modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.error-details-modal .modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.error-detail-item {
  margin-bottom: 16px;
}

.error-detail-item label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  font-size: 14px;
}

.error-detail-item span,
.error-detail-item code {
  color: var(--text-secondary);
  font-size: 14px;
}

.error-detail-item code {
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
}

.error-detail-item pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin-top: 4px;
}

.error-detail-item pre code {
  background: none;
  padding: 0;
  font-size: 12px;
  line-height: 1.4;
  color: #f8f8f2;
}

.error-details-modal .modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

#error-badge {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  z-index: 10000;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

#error-badge:hover {
  transform: scale(1.1);
}
`;

// Inject CSS (wrapped in function scope to avoid global variable conflicts)
(function() {
  const errorHandlerStyleElement = document.createElement('style');
  errorHandlerStyleElement.textContent = errorCSS;
  document.head.appendChild(errorHandlerStyleElement);
})();

// Add error badge to page
const errorBadge = document.createElement('div');
errorBadge.id = 'error-badge';
errorBadge.title = 'Click to view errors';
errorBadge.onclick = () => errorHandler.showErrorConsole();
document.body.appendChild(errorBadge);

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}