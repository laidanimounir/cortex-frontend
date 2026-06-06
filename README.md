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
- ✅ **Groq Cascade (4 models)**: Auto-retry on failure — no more single point of failure
- ✅ **Auto Language Detection**: AR/EN automatically detected from user message text
- ✅ **Fallback Toast Notification**: Subtle "Optimizing..." toast when switching models in cascade
- ✅ **Dashboard Stability**: Graceful handling of missing localStorage
- ✅ **File Generation & Preview**: Auto-detected PDF, DOCX, Excel, TXT export with split-panel preview

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
│  POST /  → api/chat.cjs → Groq Cascade (4 models)           │
│  POST /search → api/search.cjs → Tavily API                  │
├──────────────────────────────────────────────────────────────┤
│  Groq Cascade (retries down on failure):                     │
│  - cortex-fast  → llama-3.3-70b → llama-3.1-8b              │
│                   → gemma2-9b-it → mixtral-8x7b              │
│  - cortex-think → deepseek-r1 → (same cascade above)        │
│  - cortex-vision → uses cascade / no separate provider       │
│  - Future: OpenRouter Level 5 when OPENROUTER_API_KEY set    │
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
OPENROUTER_API_KEY=your_openrouter_api_key   # Optional: future fallback
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
| `OPENROUTER_API_KEY` | API key for OpenRouter fallback | Optional — future fallback |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID | Optional |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID | Optional |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key | Optional |
| `TAVILY_API_KEY` | API key for Tavily web search | Optional |
| `VITE_SUPABASE_URL` | Supabase project URL | Optional |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Optional |

### Dependencies

| Package | Version | Purpose |
|---|---|---|
| `groq-sdk` | ^1.2.0 | Groq AI API client |
| `jspdf` | ^3.0.4 | PDF file generation |
| `docx` | ^x.x.x | DOCX file generation |
| `xlsx` | ^x.x.x | Excel file generation |
| `katex` | ^0.17.0 | Math rendering |
| `react-markdown` | ^10.1.0 | Markdown rendering |
| `react-syntax-highlighter` | ^16.1.0 | Code highlighting |
| `remark-gfm` | ^4.0.1 | GitHub-flavored markdown tables |
| `@supabase/supabase-js` | ^2.106.2 | Optional cloud sync |
| `@emailjs/browser` | ^4.4.1 | Email sharing |

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

#### G — Reliability & Resilience
- ✅ **Groq Cascade (4 models)**: auto-retry on failure — no more single point of failure
- ✅ **Auto Language Detection**: AR/EN detected from message text, not UI toggle
- ✅ **Explicit Language Injection**: fixes DeepSeek Chinese output
- ✅ **15s Timeout per model**: prevents hanging on overloaded provider
- ✅ **Fallback Toast**: subtle "Optimizing..." notification when model switches
- ✅ **Dashboard Null Guard**: graceful handling of empty localStorage

#### H — File Generation & Preview
- ✅ Auto-detects file intent from user message (PDF, DOCX, Excel, TXT)
- ✅ Split-panel layout: chat on left, preview on right
- ✅ Preview renders markdown before download
- ✅ Supported formats:
  - **PDF** — via jsPDF
  - **DOCX** — via docx.js
  - **Excel** — via SheetJS (xlsx)
  - **TXT** — plain text
- ✅ One-click download button
- ✅ No fake URLs or placeholders in generated content (enforced via system prompt)

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

## Known Issues & Fixes

### 🐛 "All providers failed" after several messages

**Root Cause:**
The full conversation history was sent to the AI provider
on every request with no trimming or token limit check.
After several long messages (e.g. code blocks, HTML, SQL),
the total token count exceeded the provider's context window,
causing a 400 error. The fallback logic was only triggered
for 429 and 503 errors, so the 400 was silently swallowed
and returned as "All providers failed" with no logging.

**Fixes Applied:**
- ✅ Added `trimMessages()` — keeps only last 10 messages,
  truncates messages longer than 2000 chars
- ✅ Fallback now triggers on ALL provider errors, not just 429/503
- ✅ Both Groq and fallback errors are now logged to console
  with status code and message
- ✅ User sees a friendly error message instead of raw error text

**Files Changed:**
- `api/chat.cjs` — lines 44-47 (trimming), 112 (fallback trigger), 146 (error logging)
- `src/[your chat component]` — error display handler

### 🐛 DeepSeek outputs Chinese despite EN system prompt

**Root Cause:**
The `cortex-think` model (`deepseek-r1-distill-llama-70b`) has a strong training bias toward Chinese. Even with a system prompt requesting English, DeepSeek occasionally responded in Chinese.

**Fixes Applied:**
- ✅ An explicit `You must respond in {language} only. Never use Chinese.` system message is injected after the main SYSTEM_PROMPT
- ✅ Language is auto-detected from the user's message text (Arabic Unicode range check) rather than relying on the UI toggle

**Files Changed:**
- `api/chat.cjs` — language injection after fullMessages assembly line 66-71
- `src/pages/ChatPage.jsx` — auto-detection override before sendMessage call

### 🐛 Groq hangs indefinitely under load

**Root Cause:**
The `groq-sdk` HTTP call had no timeout. When Groq was overloaded or network was slow, the connection never resolved, leaving the user stuck at "Typing..." forever.

**Fixes Applied:**
- ✅ Added 15-second `AbortController` timeout on every Groq model call
- ✅ Cascade moves to the next model if a model times out
- ✅ Both first-chunk latency and total request time logged via `console.time`

### 🐛 Single Groq model = single point of failure

**Root Cause:**
Only one model was configured per alias. Rate limits (429), quota exhaustion, or transient errors killed the session with no recovery.

**Fixes Applied:**
- ✅ 4-level Groq cascade: `llama-3.3-70b` → `llama-3.1-8b` → `gemma2-9b-it` → `mixtral-8x7b`
- ✅ `cortex-think` tries `deepseek-r1-distill-llama-70b` first, then falls through to same cascade
- ✅ Each model gets its own 15s timeout before the next is tried
- ✅ SSE `{"type":"fallback"}` event sent so frontend can show "Optimizing..." toast
- ✅ Final failure returns `502` with `"All providers failed"` + reason

**Files Changed:**
- `api/chat.cjs` — entire file rewritten for cascade logic
- `src/services/chat.js` — `onFallback` callback support

### 🐛 Dashboard crashes when localStorage is empty

**Root Cause:**
`Dashboard.jsx` tried to access `stats.weeklyActivity` before checking if `stats` was null, causing a runtime crash on first visit with no chat history.

**Fixes Applied:**
- ✅ Added `if (!stats) return null;` guard before accessing stats properties

**Files Changed:**
- `src/pages/Dashboard.jsx` — null guard on stats

---

## Built by Mounir

100% Algerian-made. 🇩🇿
