export const config = {
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'deepseek-coder:latest',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '120000', 10),
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    corsOrigin: process.env.CORS_ORIGIN || '*', // Allow all origins for Vercel
  },
  review: {
    maxCodeLength: 50000,
    maxLines: 500,
    defaultLanguage: 'javascript',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20, // per window
  },
};
