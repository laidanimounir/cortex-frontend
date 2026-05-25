const Groq = require('groq-sdk');

const { SYSTEM_PROMPT } = require('./system-prompt.cjs');

const MODEL_MAP = {
  'cortex-fast': 'llama-3.3-70b-versatile',
  'cortex-think': 'deepseek-r1-distill-llama-70b',
};

/* FIX 1 - slice from start */
function trimMessages(messages, maxMessages = 10, maxCharsPerMessage = 6000) {
  const trimmed = messages.slice(-maxMessages);
  return trimmed.map(msg => ({
    ...msg,
    content: typeof msg.content === 'string'
      && msg.content.length > maxCharsPerMessage
        ? msg.content.slice(0, maxCharsPerMessage) + '\n[...truncated]'
        : msg.content
  }));
}

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

  /* FIX 2 - filter double system */
  const filteredMessages = trimMessages(
    messages.filter(m => m.role !== 'system')
  );

  const fullMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...filteredMessages,
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

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const stream = await groq.chat.completions.create({
      model: selectedModel,
      messages: fullMessages,
      stream: true,
      max_tokens: 4096,
    });

    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content || '';
      if (token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    /* FIX 2 - Fallback Trigger */
    console.error('[Groq Error]', {
      status: error.status,
      message: error.message,
    });
    // Always attempt fallback regardless of error type
    try {
      const fallbackStream = await callOpenRouterFallback(fullMessages);
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
      /* FIX 3 - Error Logging */
      console.error('[Fallback Error]', {
        status: fallbackError.status,
        message: fallbackError.message,
        stack: fallbackError.stack,
      });
      /* FIX 3 - headers guard */
      if (!res.headersSent) {
        res.status(502).json({
          error: 'All providers failed',
          reason: fallbackError.message,
        });
      } else {
        res.write(`data: ${JSON.stringify({ 
          error: 'All providers failed' 
        })}\n\n`);
        res.end();
      }
    }
  }
};
