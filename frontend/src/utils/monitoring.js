/**
 * Performance monitoring utilities for the frontend application
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.apiTimes = new Map();
    this.pageLoadTimes = new Map();
    this.errorCount = 0;
    this.isEnabled = process.env.NODE_ENV === 'production';
    
    this.init();
  }

  init() {
    if (!this.isEnabled) return;

    // Monitor page load times
    this.monitorPageLoad();
    
    // Monitor API response times
    this.monitorAPIRequests();
    
    // Monitor errors
    this.monitorErrors();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor user interactions
    this.monitorUserInteractions();
  }

  monitorPageLoad() {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
      const firstPaint = this.getFirstPaintTime();
      
      this.recordMetric('page_load_time', pageLoadTime);
      this.recordMetric('dom_content_loaded', domContentLoaded);
      this.recordMetric('first_paint', firstPaint);
      
      console.log(`Page Load Time: ${pageLoadTime}ms`);
      console.log(`DOM Content Loaded: ${domContentLoaded}ms`);
      console.log(`First Paint: ${firstPaint}ms`);
    });
  }

  getFirstPaintTime() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  monitorAPIRequests() {
    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordAPITime(url, duration, response.status);
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordAPITime(url, duration, 0, error.message);
        throw error;
      }
    };

    // Intercept XMLHttpRequest
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const startTime = performance.now();
      
      xhr.addEventListener('loadend', () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordAPITime(xhr.responseURL, duration, xhr.status);
      });
      
      return xhr;
    };
  }

  recordAPITime(endpoint, duration, status, error = null) {
    if (!this.isEnabled) return;

    const key = this.sanitizeEndpoint(endpoint);
    const metric = {
      endpoint: key,
      duration,
      status,
      error,
      timestamp: Date.now()
    };

    if (!this.apiTimes.has(key)) {
      this.apiTimes.set(key, []);
    }

    const times = this.apiTimes.get(key);
    times.push(metric);

    // Keep only last 100 requests per endpoint
    if (times.length > 100) {
      times.shift();
    }

    // Log slow requests
    if (duration > 2000) {
      console.warn(`Slow API request: ${key} took ${duration.toFixed(2)}ms`);
    }

    // Log failed requests
    if (status >= 400) {
      console.error(`API request failed: ${key} - ${status} - ${error || 'Unknown error'}`);
    }
  }

  sanitizeEndpoint(url) {
    // Remove query parameters and IDs to group similar requests
    return url
      .replace(/\?.*$/, '')
      .replace(/\/\d+/g, '/:id')
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
      .replace(/\/[a-f0-9-]{8}-[a-f0-9-]{4}-[a-f0-9-]{4}-[a-f0-9-]{12}/g, '/:uuid');
  }

  monitorErrors() {
    // Monitor JavaScript errors
    window.addEventListener('error', (event) => {
      this.errorCount++;
      this.recordError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.errorCount++;
      this.recordError('unhandled_promise_rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });

    // Monitor resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.errorCount++;
        this.recordError('resource_error', {
          type: event.target.tagName,
          src: event.target.src || event.target.href,
          message: 'Resource failed to load'
        });
      }
    }, true);
  }

  recordError(type, details) {
    if (!this.isEnabled) return;

    const error = {
      type,
      details,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Application Error:', error);
    
    // Send to error tracking service (e.g., Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(new Error(details.message || type), {
        extra: details
      });
    }
  }

  monitorMemoryUsage() {
    if (!performance.memory) return;

    setInterval(() => {
      const memory = performance.memory;
      this.recordMetric('memory_used', memory.usedJSHeapSize);
      this.recordMetric('memory_total', memory.totalJSHeapSize);
      this.recordMetric('memory_limit', memory.jsHeapSizeLimit);

      // Log memory warnings
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      if (usagePercent > 80) {
        console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`);
      }
    }, 30000); // Check every 30 seconds
  }

  monitorUserInteractions() {
    let interactionCount = 0;
    let lastInteraction = Date.now();

    const trackInteraction = () => {
      interactionCount++;
      lastInteraction = Date.now();
    };

    // Track various user interactions
    ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, trackInteraction, { passive: true });
    });

    // Report interaction metrics every 5 minutes
    setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteraction;
      this.recordMetric('interaction_count', interactionCount);
      this.recordMetric('time_since_last_interaction', timeSinceLastInteraction);
      
      // Reset counter
      interactionCount = 0;
    }, 300000);
  }

  recordMetric(name, value) {
    if (!this.isEnabled) return;

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metric = {
      name,
      value,
      timestamp: Date.now()
    };

    this.metrics.get(name).push(metric);

    // Keep only last 1000 metrics per type
    const metrics = this.metrics.get(name);
    if (metrics.length > 1000) {
      metrics.shift();
    }
  }

  getMetrics() {
    const result = {};

    // Aggregate metrics
    for (const [name, values] of this.metrics) {
      const numericValues = values.map(v => v.value).filter(v => typeof v === 'number');
      if (numericValues.length > 0) {
        result[name] = {
          count: numericValues.length,
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          latest: values[values.length - 1]?.value
        };
      }
    }

    // API metrics
    result.api_metrics = {};
    for (const [endpoint, requests] of this.apiTimes) {
      const durations = requests.map(r => r.duration);
      const statuses = requests.map(r => r.status);
      
      result.api_metrics[endpoint] = {
        request_count: requests.length,
        avg_duration: durations.reduce((a, b) => a + b, 0) / durations.length,
        min_duration: Math.min(...durations),
        max_duration: Math.max(...durations),
        success_rate: statuses.filter(s => s >= 200 && s < 400).length / statuses.length,
        error_count: statuses.filter(s => s >= 400).length
      };
    }

    result.error_count = this.errorCount;
    result.timestamp = Date.now();

    return result;
  }

  sendMetrics() {
    if (!this.isEnabled) return;

    const metrics = this.getMetrics();
    
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'performance_metrics', {
        custom_map: metrics
      });
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metrics)
    }).catch(error => {
      console.warn('Failed to send performance metrics:', error);
    });
  }

  // Component performance monitoring
  measureComponent(name, renderFunction) {
    return (...args) => {
      const startTime = performance.now();
      const result = renderFunction(...args);
      const endTime = performance.now();
      
      this.recordMetric(`component_${name}_render_time`, endTime - startTime);
      return result;
    };
  }

  // Route performance monitoring
  measureRoute(name, routeFunction) {
    return (...args) => {
      const startTime = performance.now();
      const result = routeFunction(...args);
      const endTime = performance.now();
      
      this.recordMetric(`route_${name}_load_time`, endTime - startTime);
      return result;
    };
  }

  // Custom performance marks
  mark(name) {
    if (performance.mark) {
      performance.mark(name);
    }
  }

  measure(name, startMark, endMark) {
    if (performance.measure) {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name, 'measure');
      if (measures.length > 0) {
        this.recordMetric(name, measures[measures.length - 1].duration);
      }
    }
  }

  // Bundle size monitoring
  monitorBundleSize() {
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      const jsFiles = resources.filter(r => r.name.endsWith('.js'));
      const cssFiles = resources.filter(r => r.name.endsWith('.css'));
      
      const totalJSSize = jsFiles.reduce((sum, file) => sum + file.transferSize, 0);
      const totalCSSSize = cssFiles.reduce((sum, file) => sum + file.transferSize, 0);
      
      this.recordMetric('bundle_js_size', totalJSSize);
      this.recordMetric('bundle_css_size', totalCSSSize);
      this.recordMetric('bundle_total_size', totalJSSize + totalCSSSize);
    }
  }

  // Network monitoring
  monitorNetwork() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      this.recordMetric('connection_type', connection.effectiveType);
      this.recordMetric('connection_downlink', connection.downlink);
      this.recordMetric('connection_rtt', connection.rtt);
      
      connection.addEventListener('change', () => {
        this.recordMetric('connection_type', connection.effectiveType);
        this.recordMetric('connection_downlink', connection.downlink);
        this.recordMetric('connection_rtt', connection.rtt);
      });
    }
  }

  // Start periodic reporting
  startReporting(interval = 300000) { // 5 minutes
    setInterval(() => {
      this.sendMetrics();
    }, interval);
  }

  // Get performance report
  getReport() {
    return {
      metrics: this.getMetrics(),
      pageLoadTime: this.pageLoadTimes,
      apiTimes: Object.fromEntries(this.apiTimes),
      errorCount: this.errorCount,
      timestamp: Date.now()
    };
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor();

// Export for use in components
export default performanceMonitor;

// Higher-order component for performance monitoring
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return React.memo((props) => {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      performanceMonitor.recordMetric(`component_${componentName}_mount_time`, endTime - startTime);
    });

    return React.createElement(WrappedComponent, props);
  });
};

// Hook for performance monitoring
export const usePerformanceMonitoring = (name) => {
  const startTime = React.useRef(performance.now());
  
  React.useEffect(() => {
    const endTime = performance.now();
    performanceMonitor.recordMetric(`hook_${name}_execution_time`, endTime - startTime.current);
  });

  return {
    mark: (markName) => performanceMonitor.mark(markName),
    measure: (measureName, startMark, endMark) => performanceMonitor.measure(measureName, startMark, endMark)
  };
};
