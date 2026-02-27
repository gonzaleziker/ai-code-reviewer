# AI Code Reviewer

A powerful AI-powered code reviewer that runs locally using Ollama and DeepSeek Coder. 100% free - you only pay for electricity! ⚡

![AI Code Reviewer](https://img.shields.io/badge/AI-Code%20Reviewer-green) ![Ollama](https://img.shields.io/badge/Powered%20by-Ollama-blue) ![React](https://img.shields.io/badge/Built%20with-React-blue)

## ✨ Features

- 🔒 **Privacy-First**: All code stays on your machine
- 🚀 **Fast**: DeepSeek Coder 6.7B optimized for code analysis
- 📝 **Professional Prompts**: Structured JSON responses
- 🎨 **Beautiful UI**: Clean SaaS-style interface
- 🌙 **Dark Mode**: Easy on the eyes
- 📜 **History**: Save reviews in localStorage
- 📊 **Code Score**: 0-100 quality score
- 🔍 **Strict Mode**: Production-grade critical review
- 📥 **Export**: Download reviews as Markdown

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   User Code    │ ──▶  │  Express API   │ ──▶  │     Ollama      │
│   (Frontend)   │      │   (Backend)    │      │  DeepSeek Coder │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## 📋 Requirements

- Node.js 18+
- Ollama installed and running
- 8GB+ RAM (16GB recommended for best performance)

## 🚀 Quick Start

### 1. Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [ollama.com](https://ollama.com/download)

### 2. Pull the Model

```bash
# Pull DeepSeek Coder (recommended - 6.7B)
ollama pull deepseek-coder

# Or Code Llama (alternative)
ollama pull codellama

# Verify it's installed
ollama list
```

### 3. Start Ollama

```bash
# Start the Ollama service
ollama serve

# In another terminal, verify it's running
curl http://localhost:11434/api/tags
```

### 4. Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or manually:
cd server && npm install
cd ../client && npm install
```

### 5. Run the Application

```bash
# Development mode (runs both server and client)
npm run dev

# Or run separately:
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
```

### 6. Open in Browser

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## 🐳 Docker Installation

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
npm run docker:up

# View logs
docker-compose logs -f

# Stop services
npm run docker:down
```

### Option 2: Manual Docker

```bash
# Build and run each service
cd server && docker build -t ai-code-reviewer-server .
cd client && docker build -t ai-code-reviewer-client .
```

## 📖 Usage

1. **Paste your code** in the Monaco Editor
2. **Select language** from dropdown
3. **(Optional) Enable Strict Mode** for production-grade reviews
4. **Click "Review Code"** 
5. **View results**: Summary, issues with severity badges, refactored code
6. **Export** as Markdown if needed

## 🔧 Configuration

### Environment Variables

**Server (`server/.env`):**
```env
PORT=3001
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-coder:6.7b
OLLAMA_TIMEOUT=120000
CORS_ORIGIN=http://localhost:5173
```

### Supported Languages

- JavaScript
- TypeScript
- Python
- Java
- C#
- C++
- Go
- Rust
- Ruby
- PHP
- Swift
- Kotlin

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Check Ollama status |
| `/api/review` | POST | Submit code for review |
| `/api/review/stream` | POST | Stream review response |

### Review Request Example

```bash
curl -X POST http://localhost:3001/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function add(a, b) { return a + b; }",
    "language": "javascript",
    "strictMode": false
  }'
```

## 📁 Project Structure

```
ai-code-reviewer/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── ...
├── server/                 # Backend (Node + Express)
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Ollama service
│   │   ├── config/        # Configuration
│   │   └── types/         # TypeScript types
│   └── ...
├── docker-compose.yml
└── README.md
```

## 💡 Tips for Best Results

1. **Keep code reasonable**: Up to 500 lines works best
2. **Use descriptive variable names**: The AI analyzes naming
3. **Enable Strict Mode** for production code reviews
4. **Check history**: Previous reviews are saved locally

## 🔨 Troubleshooting

### Ollama not running
```bash
# Check if Ollama is running
curl http://localhost:11434

# Start Ollama
ollama serve
```

### Model not found
```bash
# Pull the model again
ollama pull deepseek-coder
```

### Port already in use
```bash
# Change port in server/src/config/index.ts
```

### Out of memory
```bash
# Use a smaller model
ollama pull deepseek-coder:3b
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use for personal and commercial projects.

## 🙏 Acknowledgments

- [Ollama](https://ollama.com) - For making local AI accessible
- [DeepSeek](https://deepseek.com) - For the excellent code model
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - For the VS Code editor experience
