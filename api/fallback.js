const { SYSTEM_PROMPT } = require('./system-prompt');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, model } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const MODEL_MAP = {
    'cortex-fast': 'google/gemini-flash-2.0',
    'cortex-think': 'google/gemini-flash-2.0',
    'cortex-vision': 'google/gemini-flash-2.0',
  };

  const selectedModel = MODEL_MAP[model] || MODEL_MAP['cortex-fast'];

  const fullMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: fullMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');

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
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
          } else {
            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content || '';
              if (token) {
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
              }
            } catch (e) {
              // skip malformed chunks
            }
          }
        }
      }
    }

    res.end();
  } catch (error) {
    res.status(502).json({ error: 'Fallback provider failed' });
  }
};
