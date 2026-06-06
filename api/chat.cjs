const Groq = require('groq-sdk');

const { SYSTEM_PROMPT } = require('./system-prompt.cjs');

const MODEL_MAP = {
  'cortex-fast': 'llama-3.3-70b-versatile',
  'cortex-think': 'deepseek-r1-distill-llama-70b',
  'cortex-vision': 'llama-3.3-70b-versatile',
};

const GROQ_CASCADE = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
];

const GROQ_CASCADE_THINK = [
  'deepseek-r1-distill-llama-70b',
  ...GROQ_CASCADE,
];

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

async function streamGroqCascade(groq, messages, model, res) {
  const isThink = model === 'cortex-think';
  const cascade = isThink ? GROQ_CASCADE_THINK : GROQ_CASCADE;

  for (const groqModel of cascade) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    console.time(`groq-${groqModel}`);

    try {
      const stream = await groq.chat.completions.create({
        model: groqModel,
        messages,
        stream: true,
        max_tokens: 4096,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (groqModel !== cascade[0]) {
        res.write(`data: ${JSON.stringify({ type: 'fallback', message: 'Optimizing...' })}\n\n`);
      }

      console.log('[Model Used]', groqModel);

      let isFirstChunk = true;
      for await (const chunk of stream) {
        if (isFirstChunk) {
          console.timeEnd(`groq-${groqModel}`);
          isFirstChunk = false;
        }
        const token = chunk.choices?.[0]?.delta?.content || '';
        if (token) {
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    } catch (error) {
      clearTimeout(timeout);
      console.error('[Groq Error]', {
        status: error.status,
        message: error.message,
        model: groqModel,
      });

      if (groqModel === cascade[cascade.length - 1]) {
        // Level 5: OpenRouter handles after loop
      }
    }
  }

  console.log('[Switching to OpenRouter]');
  try {
    await streamOpenRouter(messages, res);
  } catch (error) {
    console.error('[OpenRouter Error]', {
      message: error.message,
      status: error.status,
    });
    throw error;
  }
}

async function streamOpenRouter(messages, res) {
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
    throw new Error(`OpenRouter error: ${response.status}`);
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
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, model, language } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  /* FIX 2 - filter double system */
  const filteredMessages = trimMessages(
    messages.filter(m => m.role !== 'system')
  );

  const fullMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...filteredMessages,
  ];

  if (language) {
    fullMessages.push({
      role: 'system',
      content: `You must respond in ${language} only. Never use Chinese. Never mix languages. If language is "ar", respond in Arabic only. If language is "en", respond in English only.`,
    });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    await streamGroqCascade(groq, fullMessages, model, res);
  } catch (error) {
    console.error('[Groq Cascade Error]', {
      message: error.message,
      status: error.status,
    });
    if (!res.headersSent) {
      res.status(502).json({
        error: 'All providers failed',
        reason: error.message,
      });
    } else {
      res.write(`data: ${JSON.stringify({ 
        error: 'All providers failed' 
      })}\n\n`);
      res.end();
    }
  }
};
