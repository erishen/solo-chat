# Solo Chat

A modern AI chat assistant built with React + TypeScript + Vite, integrated with Ollama local LLM support.

## ✨ Features

- 🤖 **AI Chat** — Ollama local models with real-time streaming
- 🖼️ **Multimodal** — Image upload and analysis
- 🎨 **Modern UI** — Tailwind CSS, beautiful interface
- ⚡ **High Performance** — Vite build, HMR, code splitting
- 🔒 **Type Safety** — TypeScript strict mode, full type checking
- 🧪 **Test Coverage** — Vitest unit tests
- 📱 **Responsive** — Adapts to all screen sizes

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Ollama (optional, for local AI)

### Install

```bash
npm install
```

### Configure

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3002 |
| `NODE_ENV` | Environment | development |
| `CORS_ORIGIN` | Allowed origins | — |
| `OLLAMA_BASE_URL` | Ollama service URL | — |
| `LOG_LEVEL` | Log level | — |

### Start Dev Server

```bash
npm run dev
```

Starts frontend (http://localhost:5173) and backend API (http://localhost:3002).

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm test
npm run test:ui        # Test UI
npm run test:coverage  # Coverage report
```

## 📁 Project Structure

```
solo-chat/
├── api/                    # Backend API
│   ├── middleware/         # Middleware
│   ├── routes/             # Routes (auth, chat, ollama)
│   ├── schemas/            # Validation schemas
│   ├── services/           # Business logic
│   ├── test/               # API tests
│   ├── utils/              # Utilities
│   ├── app.ts              # Express app
│   ├── index.ts            # Vercel entry
│   └── server.ts           # Local server
├── src/                    # Frontend
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities
│   ├── pages/              # Pages (Chat, Home, Settings, Invest, Knowledge)
│   ├── store/              # Zustand store
│   ├── test/               # Frontend tests
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── .env.example
├── TODO.md
└── package.json
```

## 🔌 API Reference

### Base URL

- Dev: `http://localhost:3002/api`
- Production: per deployment

### Endpoints

#### 1. Health Check

```http
GET /api/health
```

```json
{"success": true, "message": "ok"}
```

#### 2. Chat

```http
POST /api/chat
```

**Request:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello!",
      "images": ["base64imagedata"]
    }
  ],
  "model": "gemma4:latest",
  "options": {"temperature": 0.7},
  "ollamaUrl": "http://localhost:11434"
}
```

**Response:** SSE stream

```
data: {"content":"Hello"}
data: {"content":" there"}
data: [DONE]
```

#### 3. Ollama Status

```http
GET /api/ollama/status?url=http://localhost:11434
```

```json
{
  "connected": true,
  "models": ["gemma4:latest", "llama2:latest"]
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Validation failed |
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | Unauthorized |
| `FORBIDDEN` | Forbidden |
| `OLLAMA_ERROR` | Ollama service error |
| `INTERNAL_ERROR` | Internal server error |

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18
- **Build**: Vite 6
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 7
- **State**: Zustand 5
- **Icons**: Lucide React

### Backend

- **Framework**: Express 4
- **Language**: TypeScript 5.8
- **Validation**: Zod 4
- **Logging**: Pino
- **Rate Limit**: express-rate-limit

### Testing

- **Framework**: Vitest
- **Library**: @testing-library/react
- **DOM Mock**: jsdom

## 📝 Development

### Code Style

Strict ESLint rules: unused variables, TypeScript strict mode, React Hooks rules.

### Before Committing

```bash
npm run check   # Type check
npm run lint    # Lint
npm test        # Tests
```

### Adding Features

1. Create component in `src/pages/` or `src/components/`
2. Add API route in `api/routes/`
3. Add schema in `api/schemas/`
4. Write unit tests
5. Update docs

## 🚢 Deployment

### Vercel

1. Connect GitHub repo to Vercel
2. Configure env vars
3. Auto-deploy

### Manual

```bash
npm run build
npm run preview
```

## 📄 License

MIT License
