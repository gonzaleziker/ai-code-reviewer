// Issue types matching backend
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

export interface ReviewRequest {
  code: string;
  language: string;
  strictMode: boolean;
}

export interface ReviewResponse {
  success: boolean;
  data?: CodeReview;
  error?: string;
}

export interface HistoryItem {
  id: string;
  code: string;
  language: string;
  review: CodeReview;
  timestamp: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  ollama: {
    available: boolean;
    models: string[];
    model: string;
  };
}

// Language options
export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
] as const;

export type Language = typeof LANGUAGES[number]['value'];
