/**
 * Date range utility functions for analytics
 */

/**
 * Get array of last N days
 * @param {number} days - Number of days to get
 * @returns {Array} Array of date strings
 */
export const getLastNDays = (days) => {
  const dates = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

/**
 * Get last 7 days
 * @returns {Array} Array of last 7 date strings
 */
export const getLast7Days = () => {
  return getLastNDays(7);
};

/**
 * Get last 30 days
 * @returns {Array} Array of last 30 date strings
 */
export const getLast30Days = () => {
  return getLastNDays(30);
};

/**
 * Get last 90 days
 * @returns {Array} Array of last 90 date strings
 */
export const getLast90Days = () => {
  return getLastNDays(90);
};

/**
 * Get custom date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Array} Array of date strings in range
 */
export const getDateRange = (startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'full')
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (date, format = 'short') => {
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    case 'long':
      return d.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    case 'full':
      return d.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    default:
      return d.toLocaleDateString();
  }
};

/**
 * Get date range label for display
 * @param {string} range - Date range ('7', '30', '90', 'all')
 * @returns {string} Human-readable date range label
 */
export const getDateRangeLabel = (range) => {
  const today = new Date();
  
  switch (range) {
    case '7':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return `${formatDateForDisplay(weekAgo)} - ${formatDateForDisplay(today)}`;
      
    case '30':
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return `${formatDateForDisplay(monthAgo)} - ${formatDateForDisplay(today)}`;
      
    case '90':
      const quarterAgo = new Date(today);
      quarterAgo.setDate(quarterAgo.getDate() - 90);
      return `${formatDateForDisplay(quarterAgo)} - ${formatDateForDisplay(today)}`;
      
    case 'all':
      return 'All Time';
      
    default:
      return 'Custom Range';
  }
};

/**
 * Check if date is within range
 * @param {Date|string} date - Date to check
 * @param {string} range - Date range ('7', '30', '90', 'all')
 * @returns {boolean} True if date is within range
 */
export const isDateInRange = (date, range) => {
  if (range === 'all') return true;
  
  const checkDate = new Date(date);
  const today = new Date();
  const daysAgo = parseInt(range);
  const rangeStart = new Date(today);
  rangeStart.setDate(rangeStart.getDate() - daysAgo);
  
  return checkDate >= rangeStart && checkDate <= today;
};

/**
 * Get relative time string
 * @param {Date|string} date - Date to get relative time for
 * @returns {string} Relative time string (e.g., "2 days ago")
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now - targetDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

/**
 * Get start and end dates for range
 * @param {string} range - Date range ('7', '30', '90', 'all')
 * @returns {Object} Object with start and end dates
 */
export const getRangeDates = (range) => {
  const today = new Date();
  
  switch (range) {
    case '7':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { start: weekAgo, end: today };
      
    case '30':
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return { start: monthAgo, end: today };
      
    case '90':
      const quarterAgo = new Date(today);
      quarterAgo.setDate(quarterAgo.getDate() - 90);
      return { start: quarterAgo, end: today };
      
    case 'all':
      // Return a very old date for "all time"
      const veryOld = new Date('2020-01-01');
      return { start: veryOld, end: today };
      
    default:
      return { start: today, end: today };
  }
};
