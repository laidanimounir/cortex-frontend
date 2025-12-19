

const API_BASE_URL = "http://127.0.0.1:5000";


let currentSessionId = null;


export async function createNewSession() {
  try {
    const response = await fetch(`${API_BASE_URL}/session/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    currentSessionId = data.session_id;
    return data;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}


export async function getSessionId() {
  if (!currentSessionId) {
    const session = await createNewSession();
    return session.session_id;
  }
  return currentSessionId;
}

export async function clearSession() {
  if (!currentSessionId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/session/clear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: currentSessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    currentSessionId = null;
    return await response.json();
  } catch (error) {
    console.error("Error clearing session:", error);
    throw error;
  }
}


export async function getSessionInfo() {
  if (!currentSessionId) return null;

  try {
    const response = await fetch(
      `${API_BASE_URL}/session/info?session_id=${currentSessionId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting session info:", error);
    throw error;
  }
}

/**

  @param {string} question 
  @returns {Promise<Object>} 
 */
export async function askQuestion(question) {
  try {
    const sessionId = await getSessionId();

    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error asking question:", error);
    throw error;
  }
}


export async function addQAPair(question, answer, metadata = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        answer,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding Q&A pair:", error);
    throw error;
  }
}


export async function getStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting stats:", error);
    throw error;
  }
}


export async function searchByCategory(category, limit = 10) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/search/category?category=${encodeURIComponent(
        category
      )}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching by category:", error);
    throw error;
  }
}


export async function getCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting categories:", error);
    throw error;
  }
}


export { API_BASE_URL };
