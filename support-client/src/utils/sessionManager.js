// Session Manager - Handles localStorage session management

const SESSION_ID_KEY = "ai_support_session_id";
const SESSIONS_HISTORY_KEY = "ai_support_sessions_history";

/**
 * Generate a unique session ID
 */
export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or create session ID from localStorage
 */
export const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
};

/**
 * Set a new session ID
 */
export const setNewSession = () => {
  const newSessionId = generateSessionId();
  localStorage.setItem(SESSION_ID_KEY, newSessionId);
  return newSessionId;
};

/**
 * Get current session ID
 */
export const getSessionId = () => {
  return localStorage.getItem(SESSION_ID_KEY);
};

/**
 * Clear session ID
 */
export const clearSessionId = () => {
  localStorage.removeItem(SESSION_ID_KEY);
};

/**
 * Add session to history
 */
export const addSessionToHistory = (sessionId, timestamp = new Date()) => {
  let history = JSON.parse(localStorage.getItem(SESSIONS_HISTORY_KEY) || "{}");

  history[sessionId] = {
    sessionId,
    createdAt: timestamp.toISOString(),
    messageCount: 0,
  };

  localStorage.setItem(SESSIONS_HISTORY_KEY, JSON.stringify(history));
};

/**
 * Get session history
 */
export const getSessionHistory = () => {
  const history = localStorage.getItem(SESSIONS_HISTORY_KEY);
  return history ? JSON.parse(history) : {};
};

/**
 * Update session message count
 */
export const updateSessionMessageCount = (sessionId, count) => {
  let history = JSON.parse(localStorage.getItem(SESSIONS_HISTORY_KEY) || "{}");

  if (history[sessionId]) {
    history[sessionId].messageCount = count;
    localStorage.setItem(SESSIONS_HISTORY_KEY, JSON.stringify(history));
  }
};

/**
 * Clear all session history
 */
export const clearAllSessionHistory = () => {
  localStorage.removeItem(SESSIONS_HISTORY_KEY);
};

export default {
  generateSessionId,
  getOrCreateSessionId,
  setNewSession,
  getSessionId,
  clearSessionId,
  addSessionToHistory,
  getSessionHistory,
  updateSessionMessageCount,
  clearAllSessionHistory,
};
