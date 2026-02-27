import { Request, Response } from 'express';
import { reviewRequestSchema } from '../types/index.js';
import { ollamaService } from '../services/ollama.service.js';
import { config } from '../config/index.js';

interface ParsedError {
  message: string;
  code?: string;
}

/**
 * Handle code review requests
 */
export async function reviewCode(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const validationResult = reviewRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
      return;
    }

    const { code, language, strictMode } = validationResult.data;

    // Check line count limit
    const lineCount = code.split('\n').length;
    if (lineCount > config.review.maxLines) {
      res.status(400).json({
        success: false,
        error: `Code too long. Maximum ${config.review.maxLines} lines allowed.`,
      });
      return;
    }

    // Check Ollama availability
    const isOllamaAvailable = await ollamaService.healthCheck();
    if (!isOllamaAvailable) {
      res.status(503).json({
        success: false,
        error: 'Ollama service is not available. Please ensure Ollama is running.',
      });
      return;
    }

    // Generate review
    const review = await ollamaService.generateReview(code, language, strictMode);

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Review error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}

/**
 * Stream code review responses (for future implementation)
 */
export async function reviewCodeStream(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = reviewRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
      return;
    }

    const { code, language, strictMode } = validationResult.data;

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = ollamaService.generateReviewStream(code, language, strictMode);
    
    for await (const chunk of stream) {
      res.write(`data: ${chunk}\n\n`);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Stream error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
    res.end();
  }
}

/**
 * Health check endpoint
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  try {
    const isOllamaAvailable = await ollamaService.healthCheck();
    const models = isOllamaAvailable ? await ollamaService.getModels() : [];

    res.json({
      status: isOllamaAvailable ? 'healthy' : 'degraded',
      ollama: {
        available: isOllamaAvailable,
        models,
        model: config.ollama.model,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Service unavailable',
    });
  }
}
