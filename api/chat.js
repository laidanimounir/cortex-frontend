const Groq = require('groq-sdk');

const { SYSTEM_PROMPT } = require('./system-prompt');

const MODEL_MAP = {
  'cortex-fast': 'llama-3.3-70b-versatile',
  'cortex-think': 'deepseek-r1-distill-llama-70b',
};

async function callOpenRouterFallback(messages) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-flash-2.0',
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter fallback failed: ${response.status}`);
  }

  return response.body;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, model } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const selectedModel = MODEL_MAP[model] || MODEL_MAP['cortex-fast'];

  const fullMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ];

  if (model === 'cortex-vision') {
    const fallbackStream = await callOpenRouterFallback(fullMessages);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
    const reader = fallbackStream.getReader();
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
    return;
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const stream = await groq.chat.completions.create({
      model: selectedModel,
      messages: fullMessages,
      stream: true,
      max_tokens: 4096,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');

    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content || '';
      if (token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    if (error.status === 429 || error.status === 503) {
      try {
        const fallbackStream = await callOpenRouterFallback(fullMessages);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('X-Accel-Buffering', 'no');
        const reader = fallbackStream.getReader();
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
      } catch (fallbackError) {
        res.status(502).json({ error: 'All providers failed' });
      }
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
