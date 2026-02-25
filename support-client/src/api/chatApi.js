// API Service for frontend - handles all backend API calls

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5002/api";

// Create a session
export const createSession = async (sessionId = null) => {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionId ? { sessionId } : {}),
  });

  if (!response.ok) {
    throw new Error("Failed to create session");
  }

  return response.json();
};

// Get all sessions
export const getSessions = async () => {
  const response = await fetch(`${API_BASE_URL}/sessions`);

  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }

  return response.json();
};

// Get a specific session
export const getSession = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch session");
  }

  return response.json();
};

// Delete a session
export const deleteSession = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete session");
  }

  return response.json();
};

// Clear messages in a session
export const clearSession = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/clear`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to clear session");
  }

  return response.json();
};

// Send a message
export const sendMessage = async (sessionId, message) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to send message");
  }

  return response.json();
};

// Get all messages for a session
export const getMessages = async (sessionId) => {
  const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }

  return response.json();
};

export default {
  createSession,
  getSessions,
  getSession,
  deleteSession,
  clearSession,
  sendMessage,
  getMessages,
};
