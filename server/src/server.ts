import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { reviewCode, healthCheck, reviewCodeStream } from './controllers/review.controller.js';

const app = express();

// Trust proxy for ngrok/cloudflare
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Routes
app.get('/api/health', healthCheck);
app.post('/api/review', reviewCode);
app.post('/api/review/stream', reviewCodeStream);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`
🚀 AI Code Reviewer Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Port: ${PORT}
   Model: ${config.ollama.model}
   Rate Limit: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs / 60000} minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
