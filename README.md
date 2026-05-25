# Cortex — AI Chat Assistant

Cortex is an intelligent AI chat interface built for students and lifelong learners. It provides fast, thoughtful answers powered by cutting-edge AI models, all wrapped in a beautiful dark-themed interface with Arabic and English support.

Built by [Mounir](https://github.com/your-username), a 100% Algerian developer.

---

## Live Demo

[Deploy on Vercel](#) — coming soon

---

## Features (Current)

### Phase 1 — Core Features
- ✅ **Three AI Models**: Cortex Fast (quick answers), Cortex Think (deep reasoning), Cortex Vision (creative tasks)
- ✅ **Real-time Streaming**: Token-by-token responses like ChatGPT
- ✅ **Smart Fallback**: Automatic switch between AI providers when rate limits are hit — completely silent
- ✅ **Multi-language**: Full English and Arabic (RTL) support
- ✅ **Dark Theme**: Professional dark UI with smooth animations
- ✅ **Chat History**: localStorage-based history with date grouping, rename, and delete
- ✅ **Export**: Download conversations as PDF, TXT, or Markdown
- ✅ **Email Sharing**: Send conversations via email (EmailJS)
- ✅ **Message Ratings**: 👍👎 feedback on every response
- ✅ **Code Highlighting**: Syntax-highlighted code blocks with one-click copy, line numbers, and language labels
- ✅ **Focus Mode**: Distraction-free reading mode
- ✅ **Context-aware Suggestions**: Smart follow-up questions based on conversation
- ✅ **Keyboard Shortcuts**: Ctrl+L clear, Ctrl+/ shortcuts, Ctrl+B sidebar toggle
- ✅ **Compact Mode**: Tighter UI for power users
- ✅ **Responsive**: Works on desktop and mobile

### Phase 2 — Advanced Features
- ✅ **KaTeX Math Rendering**: Beautiful LaTeX equation rendering with KaTeX (inline `$...$` and block `$$...$$`)
- ✅ **Web Search (Tavily)**: Auto-triggered web search for current events, with source citations below each answer
- ✅ **Image Generation (Pollinations.AI)**: Free image generation with download button, no API key required
- ✅ **User Profile**: Interest and level selection with personalized system prompts, editable from sidebar
- ✅ **Code Block Enhancements**: Line numbers and programming language labels on every code block
- ✅ **Developer Dashboard**: Password-protected analytics at `/dashboard` — usage stats, model breakdown, weekly chart
- ✅ **Supabase Sync**: Optional cloud sync for chat history, falls back to localStorage when unconfigured

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                     │
│  Routes: /splash /chat /dashboard                            │
│  Components: ChatWindow, Sidebar, MessageInput, Header       │
│  Features: MathRenderer, ImageGen, WebSearch, UserProfile    │
├──────────────────────────────────────────────────────────────┤
│              Dev Server (localhost:3001)                      │
│  POST /  → api/chat.cjs    → Groq AI (primary)              │
│            api/fallback.cjs → OpenRouter (fallback)          │
│  POST /search → api/search.cjs → Tavily API (web search)    │
├──────────────────────────────────────────────────────────────┤
│  Models (display names only, never revealed):                 │
│  - Cortex Fast   → llama-3.3-70b on Groq                     │
│  - Cortex Think  → deepseek-r1-distill-llama-70b             │
│  - Cortex Vision → gemini-flash-2.0 on OpenRouter            │
├──────────────────────────────────────────────────────────────┤
│  Storage:                                                    │
│  - localStorage (default: history, ratings, profile)         │
│  - Supabase (optional: syncs chat history across devices)    │
│  External APIs:                                              │
│  - Pollinations.ai (free image generation, no key needed)    │
│  - Tavily API (web search, requires TAVILY_API_KEY)          │
└──────────────────────────────────────────────────────────────┘
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
TAVILY_API_KEY=your_tavily_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Development Server

```bash

API dev server running on http://localhost:3001
 npm run dev:server
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
|---|---|---|---|
| `GROQ_API_KEY` | API key for Groq cloud | Yes |
| `OPENROUTER_API_KEY` | API key for OpenRouter fallback | Yes |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID | Optional |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID | Optional |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key | Optional |
| `TAVILY_API_KEY` | API key for Tavily web search | Optional |
| `VITE_SUPABASE_URL` | Supabase project URL | Optional |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Optional |

---

## Roadmap

### Phase 2 — Completed ✅

#### A — Web Search (Tavily Integration)
- ✅ Auto-triggered search for time-sensitive queries (keywords: latest, today, news, 2024/2025/2026, etc.)
- ✅ Fetches results from Tavily API before sending to AI
- ✅ Source citations shown below each answer (up to 5 sources, title + URL)
- ✅ "🔍 Searching web..." indicator during search
- ✅ Fallback to normal AI response when search is unavailable

#### B — Image Generation (Pollinations.AI)
- ✅ Image mode toggle button in message input
- ✅ Free generation via Pollinations.ai — no API key required
- ✅ Images displayed inline with loading spinner
- ✅ Download button below each generated image

#### C — Smart User Profile
- ✅ Interest selection (Science, Math, Programming, History, Literature, Business)
- ✅ Level selection (Beginner / Intermediate / Advanced)
- ✅ Profile saved to localStorage under `cortex_user_profile`
- ✅ Profile injected as system prompt with every AI request
- ✅ "Edit Profile" button in sidebar footer

#### D — Math & Code Enhancements
- ✅ KaTeX integration — renders inline `$...$` and block `$$...$$` LaTeX
- ✅ Line numbers on all code blocks
- ✅ Language labels on all code blocks (Python, JavaScript, etc.)

#### E — Cross-Device Sync (Supabase)
- ✅ Supabase client configured (`src/lib/supabase.js`) with schema
- ✅ Chat history syncs to Supabase when credentials are present
- ✅ Falls back to localStorage when Supabase is unconfigured
- ✅ SQL migration script included in code comments

#### F — Developer Dashboard
- ✅ Password-protected dashboard at `/dashboard` (password: `cortex-admin`)
- ✅ Stats: total conversations, total messages, model usage breakdown
- ✅ Weekly activity bar chart (last 7 days)
- ✅ 👍 vs 👎 rating summary
- ✅ Language usage (EN vs AR)
- ✅ "Back to Chat" navigation

### Phase 3 — Future Vision

- [ ] **Image generation (advanced)** — Stable Diffusion integration for higher quality
- [ ] **PDF & document upload** — upload and analyze any document in conversation
- [ ] **Study mode** — generate flashcards automatically from any conversation
- [ ] **Voice input & output** — speak your question, hear the answer
- [ ] **Email sharing** — send any conversation to email (UI ready, EmailJS credentials needed)
- [ ] **Specialized domain models** — dedicated modes for Medicine, Law, Engineering
- [ ] **Comet for teams** — shared workspaces for groups and businesses (29$/month/team)
- [ ] **Mobile app** — React Native version for iOS and Android
- [ ] **Fine-tuned Cortex model** — custom trained model on educational content
- [ ] **Monetization** — Freemium model (Free / Plus 5$ / Pro 12$)

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
