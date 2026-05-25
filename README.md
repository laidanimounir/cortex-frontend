# Cortex — AI Chat Assistant

Cortex is an intelligent AI chat interface built for students and lifelong learners. It provides fast, thoughtful answers powered by cutting-edge AI models, all wrapped in a beautiful dark-themed interface with Arabic and English support.

Built by [Mounir](https://github.com/your-username), a 100% Algerian developer.

---

## Live Demo

[Deploy on Vercel](#) — coming soon

---

## Features (Current)

- ✅ **Three AI Models**: Cortex Fast (quick answers), Cortex Think (deep reasoning), Cortex Vision (creative tasks)
- ✅ **Real-time Streaming**: Token-by-token responses like ChatGPT
- ✅ **Smart Fallback**: Automatic switch between AI providers when rate limits are hit — completely silent
- ✅ **Multi-language**: Full English and Arabic (RTL) support
- ✅ **Dark Theme**: Professional dark UI with smooth animations
- ✅ **Chat History**: localStorage-based history with date grouping, rename, and delete
- ✅ **Export**: Download conversations as PDF, TXT, or Markdown
- ✅ **Email Sharing**: Send conversations via email (EmailJS)
- ✅ **Message Ratings**: 👍👎 feedback on every response
- ✅ **Code Highlighting**: Syntax-highlighted code blocks with one-click copy
- ✅ **Focus Mode**: Distraction-free reading mode
- ✅ **Context-aware Suggestions**: Smart follow-up questions based on conversation
- ✅ **Keyboard Shortcuts**: Ctrl+L clear, Ctrl+/ shortcuts, Ctrl+B sidebar toggle
- ✅ **Compact Mode**: Tighter UI for power users
- ✅ **Responsive**: Works on desktop and mobile

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│            React + Vite (Vercel)                 │
├─────────────────────────────────────────────────┤
│              Vercel Serverless Functions          │
│  /api/chat.js    → Groq AI (primary)             │
│  /api/fallback.js → OpenRouter (fallback)         │
├─────────────────────────────────────────────────┤
│  Models (display names only, never revealed):     │
│  - Cortex Fast   → llama-3.3-70b on Groq         │
│  - Cortex Think  → deepseek-r1-distill-llama-70b │
│  - Cortex Vision → gemini-flash-2.0 on OpenRouter │
├─────────────────────────────────────────────────┤
│  Storage: localStorage (history, ratings)        │
└─────────────────────────────────────────────────┘
```

### Model Naming

The models are presented to users with simple, friendly names. The actual model providers and technical details are never exposed in the UI. This keeps the experience clean and focused on learning.

---

## Setup & Development

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/your-username/cortex-frontend.git
cd cortex-frontend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set the environment variables in the Vercel dashboard.

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GROQ_API_KEY` | API key for Groq cloud | Yes |
| `OPENROUTER_API_KEY` | API key for OpenRouter fallback | Yes |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID | Optional |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID | Optional |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key | Optional |

---

## Roadmap (Coming Soon)

- [ ] Image generation (AI-powered)
- [ ] PDF/document upload and analysis
- [ ] Study mode with flashcards from conversations
- [ ] Cross-device sync (Supabase)
- [ ] Email conversation sharing (EmailJS — UI ready, credentials needed)
- [ ] Specialized domain models (medicine, law, engineering)
- [ ] Mobile app (React Native)
- [ ] Voice input and output

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT

---

## Built by Mounir

100% Algerian-made. 🇩🇿
