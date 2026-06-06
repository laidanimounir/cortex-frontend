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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, model, language } = req.body;

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

  const groqController = new AbortController();
  const groqTimeout = setTimeout(() => groqController.abort(), 15000);
  console.time('groq-request');

  try {
    const stream = await groq.chat.completions.create({
      model: selectedModel,
      messages: fullMessages,
      stream: true,
      max_tokens: 4096,
      signal: groqController.signal,
    });
    clearTimeout(groqTimeout);

    let isFirstChunk = true;
    for await (const chunk of stream) {
      if (isFirstChunk) {
        console.timeEnd('groq-request');
        isFirstChunk = false;
      }
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
    /* FIX 3 - headers guard */
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
