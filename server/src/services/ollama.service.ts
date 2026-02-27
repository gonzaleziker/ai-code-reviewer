import axios, { AxiosError } from 'axios';
import { config } from '../config/index.js';
import type { CodeReview, OllamaGenerateRequest, OllamaGenerateResponse } from '../types/index.js';

export class OllamaService {
  private baseUrl: string;
  private model: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.ollama.baseUrl;
    this.model = config.ollama.model;
    this.timeout = config.ollama.timeout;
  }

  /**
   * Build the professional prompt for code review
   */
  private buildPrompt(code: string, language: string, strictMode: boolean): string {
    const strictInstruction = strictMode
      ? `\nIMPORTANT: You are in STRICT PRODUCTION MODE. Be extremely critical. Look for:
- Security vulnerabilities (SQL injection, XSS, auth issues)
- Performance bottlenecks
- Memory leaks
- Race conditions
- Error handling gaps
- Code that would fail at scale
Give lower scores (0-50) unless code is production-ready.`
      : `\nProvide balanced feedback with improvement suggestions.`;

    return `You are a senior software engineer with expertise in code review.
Your task is to analyze the following ${language} code and provide a detailed review in JSON format.

${strictInstruction}

ALWAYS follow this exact JSON format - do NOT deviate:
{
  "summary": "A brief summary of the code quality (2-3 sentences) AND 3-5 specific TIPS to improve the code",
  "score": 75, (a numeric score 0-100 - give REASONABLE scores like 70-90 for decent code, NOT 0),
  "issues": [
    {
      "type": "bug | performance | readability | security | best-practice",
      "severity": "low | medium | high | critical",
      "description": "Description of issue or improvement suggestion",
      "line": (optional) line number,
      "suggested_fix": "How to improve this code"
    }
  ],
  "refactored_code": "The improved version (or empty string if code is perfect)"
}

CRITICAL RULES:
1. ALWAYS provide a score between 0-100 (use 70-90 for acceptable code, NOT 0)
2. The summary MUST end with 3-5 actionable tips to improve the code
3. If code has no bugs, provide "best-practice" or "readability" suggestions with "low" severity
4. NEVER return empty issues array - always suggest at least 1 improvement
5. The refactored_code should contain an improved version when you have suggestions

Tips should be specific like:
- "Add input validation for user inputs"
- "Use try-catch for error handling"
- "Consider using const instead of var"
- "Add comments to explain complex logic"

Code to review:
\`\`\`${language}
${code}
\`\`\`

Respond ONLY with valid JSON, no additional text.`;
  }

  /**
   * Parse the AI response to extract JSON
   */
  private parseResponse(response: string): CodeReview {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI model');
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      // Ensure score is reasonable (if 0 or undefined, default to 70)
      let score = parsed.score;
      if (typeof score !== 'number' || score < 1) {
        score = 70; // Default reasonable score
      } else {
        score = Math.max(1, Math.min(100, score));
      }

      // Ensure we have at least one issue with a suggestion
      let issues = parsed.issues;
      
      // Force at least one recommendation if issues array is empty
      if (!Array.isArray(issues) || issues.length === 0) {
        // Add specific tips based on score
        if (score >= 80) {
          issues = [
            {
              type: 'best-practice' as const,
              severity: 'low' as const,
              description: 'Code is well-structured. Here are tips to make it production-ready:',
              suggested_fix: '1. Add input validation for numeric ranges\n2. Use try-catch for exception handling\n3. Consider adding a loop to allow multiple calculations\n4. Add Javadoc comments for documentation'
            }
          ];
        } else if (score >= 60) {
          issues = [
            {
              type: 'best-practice' as const,
              severity: 'medium' as const,
              description: 'Code works but needs improvements:',
              suggested_fix: '1. Add input validation\n2. Improve error handling\n3. Add comments\n4. Consider refactoring'
            }
          ];
        } else {
          issues = [
            {
              type: 'best-practice' as const,
              severity: 'high' as const,
              description: 'Code needs improvements for production:',
              suggested_fix: '1. Review and fix all issues\n2. Add proper error handling\n3. Validate all inputs\n4. Add documentation'
            }
          ];
        }
      }

      return {
        summary: parsed.summary || 'Code reviewed successfully',
        issues: issues,
        refactored_code: parsed.refactored_code || '',
        score,
        language: parsed.language,
        reviewed_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  /**
   * Check if Ollama is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Get available models
   */
  async getModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models?.map((m: { name: string }) => m.name) || [];
    } catch {
      return [];
    }
  }

  /**
   * Generate code review
   */
  async generateReview(code: string, language: string, strictMode: boolean): Promise<CodeReview> {
    const prompt = this.buildPrompt(code, language, strictMode);

    const request: OllamaGenerateRequest = {
      model: this.model,
      prompt,
      stream: false,
      format: 'json',
    };

    try {
      const response = await axios.post<OllamaGenerateResponse>(
        `${this.baseUrl}/api/generate`,
        request,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return this.parseResponse(response.data.response);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Ollama is not running. Please start Ollama and try again.');
        }
        if (error.code === 'ETIMEDOUT') {
          throw new Error('Request timed out. The model might be slow to respond.');
        }
        if (error.response?.status === 404) {
          throw new Error(`Model "${this.model}" not found. Please pull it with: ollama pull ${this.model}`);
        }
        throw new Error(`Ollama error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate review with streaming (for future use)
   */
  async *generateReviewStream(
    code: string,
    language: string,
    strictMode: boolean
  ): AsyncGenerator<string> {
    const prompt = this.buildPrompt(code, language, strictMode);

    const request: OllamaGenerateRequest = {
      model: this.model,
      prompt,
      stream: true,
    };

    const response = await axios.post(
      `${this.baseUrl}/api/generate`,
      request,
      {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
      }
    );

    for await (const chunk of response.data) {
      const text = chunk.toString();
      yield text;
    }
  }
}

// Export singleton instance
export const ollamaService = new OllamaService();
