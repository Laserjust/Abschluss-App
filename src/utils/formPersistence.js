import React from 'react';

/**
 * Utility functions for persisting form data across page navigation
 */

/**
 * Save form data to localStorage with a specific key
 * @param {string} key - The storage key
 * @param {object} data - The data to save
 */
export const saveFormData = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(`formData_${key}`, serializedData);
  } catch (error) {
    console.warn('Failed to save form data to localStorage:', error);
  }
};

/**
 * Load form data from localStorage
 * @param {string} key - The storage key
 * @param {object} defaultData - Default data if nothing is stored
 * @returns {object} The loaded data or default data
 */
export const loadFormData = (key, defaultData = {}) => {
  try {
    const serializedData = localStorage.getItem(`formData_${key}`);
    if (serializedData === null) {
      return defaultData;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.warn('Failed to load form data from localStorage:', error);
    return defaultData;
  }
};

/**
 * Clear form data from localStorage
 * @param {string} key - The storage key
 */
export const clearFormData = (key) => {
  try {
    localStorage.removeItem(`formData_${key}`);
  } catch (error) {
    console.warn('Failed to clear form data from localStorage:', error);
  }
};

/**
 * Auto-save hook for form data
 * @param {string} key - The storage key
 * @param {object} data - The data to auto-save
 * @param {number} delay - Debounce delay in milliseconds (default: 1000)
 */
export const useAutoSave = (key, data, delay = 1000) => {
  const timeoutRef = React.useRef(null);

  React.useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      saveFormData(key, data);
    }, delay);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, data, delay]);
};

/**
 * Hook for managing persistent form state
 * @param {string} key - The storage key
 * @param {object} initialData - Initial form data
 * @param {boolean} autoSave - Whether to auto-save changes (default: true)
 * @returns {[object, function, function]} [data, setData, clearData]
 */
export const usePersistentState = (key, initialData, autoSave = true) => {
  const [data, setData] = React.useState(() => {
    return loadFormData(key, initialData);
  });

  // Auto-save when data changes
  React.useEffect(() => {
    if (autoSave) {
      const timeoutId = setTimeout(() => {
        saveFormData(key, data);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [key, data, autoSave]);

  const clearData = React.useCallback(() => {
    setData(initialData);
    clearFormData(key);
  }, [key, initialData]);

  return [data, setData, clearData];
};

/**
 * Save data when component unmounts or page is refreshed
 * @param {string} key - The storage key
 * @param {object} data - The data to save
 */
export const useBeforeUnload = (key, data) => {
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      saveFormData(key, data);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save data when component unmounts
      saveFormData(key, data);
    };
  }, [key, data]);
};