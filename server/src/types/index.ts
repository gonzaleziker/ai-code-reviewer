import { z } from 'zod';

// Review request validation
export const reviewRequestSchema = z.object({
  code: z.string()
    .min(1, 'Code cannot be empty')
    .max(50000, 'Code too long (max 50000 characters)'),
  language: z.string().optional().default('javascript'),
  strictMode: z.boolean().optional().default(false),
});

// Issue types
export type IssueType = 'bug' | 'performance' | 'readability' | 'security' | 'best-practice';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Issue {
  type: IssueType;
  severity: Severity;
  description: string;
  line?: number;
  suggested_fix: string;
}

export interface CodeReview {
  summary: string;
  issues: Issue[];
  refactored_code: string;
  score?: number;
  language?: string;
  reviewed_at: string;
}

// Request/Response types
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;

export interface ReviewResponse {
  success: boolean;
  data?: CodeReview;
  error?: string;
}

// Ollama types
export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
  format?: 'json';
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

// Rate limit types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}
