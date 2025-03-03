/**
 * Storage Service
 * Manages data persistence using localStorage/sessionStorage 
 * with proper error handling and data validation
 */

// User profile storage key
const USER_PROFILE_KEY = 'userProfile';
// Recent analyses storage key
const RECENT_ANALYSES_KEY = 'recentAnalysis';
// Current analysis session key 
const CURRENT_ANALYSIS_KEY = 'extractedText';
// Maximum number of recent analyses to store
const MAX_RECENT_ANALYSES = 10;

/**
 * Save user profile to localStorage
 * @param {Object} profile - User profile data
 * @returns {boolean} Success status
 */
export const saveUserProfile = (profile) => {
  try {
    // Basic validation
    if (!profile || typeof profile !== 'object') {
      console.error('Invalid profile data');
      return false;
    }
    
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
};

/**
 * Get user profile from localStorage
 * @returns {Object|null} User profile or null if not found/error
 */
export const getUserProfile = () => {
  try {
    const profileData = localStorage.getItem(USER_PROFILE_KEY);
    return profileData ? JSON.parse(profileData) : null;
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    return null;
  }
};

/**
 * Check if user has created a profile
 * @returns {boolean} Whether user has a profile
 */
export const hasUserProfile = () => {
  return !!localStorage.getItem(USER_PROFILE_KEY);
};

/**
 * Save current analysis data to sessionStorage
 * @param {Object} data - Extracted and parsed blood test data
 * @returns {boolean} Success status
 */
export const saveCurrentAnalysis = (data) => {
  try {
    if (!data) {
      console.error('Invalid analysis data');
      return false;
    }
    
    sessionStorage.setItem(CURRENT_ANALYSIS_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving analysis data:', error);
    return false;
  }
};

/**
 * Get current analysis data from sessionStorage
 * @returns {Object|null} Analysis data or null if not found/error
 */
export const getCurrentAnalysis = () => {
  try {
    const analysisData = sessionStorage.getItem(CURRENT_ANALYSIS_KEY);
    return analysisData ? JSON.parse(analysisData) : null;
  } catch (error) {
    console.error('Error retrieving analysis data:', error);
    return null;
  }
};

/**
 * Save a completed analysis to the recent analyses history
 * @param {Object} analysis - Analysis result to save
 * @returns {boolean} Success status
 */
export const saveAnalysisToHistory = (analysis) => {
  try {
    if (!analysis || !analysis.summary) {
      console.error('Invalid analysis data for history');
      return false;
    }
    
    // Create history item
    const historyItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title: analysis.title || 'Blood Test Results',
      summary: analysis.summary
    };
    
    // Get existing history
    const existingHistory = localStorage.getItem(RECENT_ANALYSES_KEY);
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Add new item to the beginning and limit size
    const updatedHistory = [historyItem, ...history].slice(0, MAX_RECENT_ANALYSES);
    
    // Save updated history
    localStorage.setItem(RECENT_ANALYSES_KEY, JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Error saving to analysis history:', error);
    return false;
  }
};

/**
 * Get recent analyses history
 * @returns {Array} Array of recent analyses or empty array if none/error
 */
export const getRecentAnalyses = () => {
  try {
    const historyData = localStorage.getItem(RECENT_ANALYSES_KEY);
    return historyData ? JSON.parse(historyData) : [];
  } catch (error) {
    console.error('Error retrieving analysis history:', error);
    return [];
  }
};

/**
 * Get a specific analysis by ID
 * @param {string} id - Analysis ID to retrieve
 * @returns {Object|null} Analysis data or null if not found/error
 */
export const getAnalysisById = (id) => {
  try {
    const historyData = localStorage.getItem(RECENT_ANALYSES_KEY);
    if (!historyData) return null;
    
    const history = JSON.parse(historyData);
    return history.find(item => item.id === id) || null;
  } catch (error) {
    console.error('Error retrieving specific analysis:', error);
    return null;
  }
};

/**
 * Clear all stored data (for logout/reset functionality)
 */
export const clearAllData = () => {
  try {
    localStorage.removeItem(USER_PROFILE_KEY);
    localStorage.removeItem(RECENT_ANALYSES_KEY);
    sessionStorage.removeItem(CURRENT_ANALYSIS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};