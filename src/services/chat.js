export async function sendMessage({ messages, model, language, onToken, onDone, onError }) {
  try {
    let profilePrompt = null;
    try {
      const stored = localStorage.getItem('cortex_user_profile');
      if (stored) {
        const profile = JSON.parse(stored);
        if (profile.interests && profile.interests.length > 0 && profile.level) {
          profilePrompt = `The user is interested in: ${profile.interests.join(', ')}. Their level is: ${profile.level}. Adapt your answers accordingly.`;
        }
      }
    } catch {
        // profile not available
    }

    const enrichedMessages = profilePrompt
      ? [{ role: 'system', content: profilePrompt }, ...messages]
      : messages;

    const response = await fetch('http://localhost:3001/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: enrichedMessages, model, language }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              onToken(parsed.token);
            }
          } catch (e) {
            // skip malformed chunks
          }
        }
      }
    }

    onDone();
  } catch (error) {
    onError(error.message || 'Connection failed');
  }
}
