import { useState, useCallback } from 'react';

const STORAGE_KEY = 'cortex_message_ratings';

function loadRatings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveRatings(ratings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  } catch {
    // storage full
  }
}

export function useMessageRatings() {
  const [ratings, setRatings] = useState(loadRatings);

  const getRating = useCallback((messageId) => {
    return ratings[messageId] || null;
  }, [ratings]);

  const setRating = useCallback((messageId, value) => {
    setRatings(prev => {
      const next = { ...prev, [messageId]: value };
      saveRatings(next);
      return next;
    });
  }, []);

  return { getRating, setRating };
}
