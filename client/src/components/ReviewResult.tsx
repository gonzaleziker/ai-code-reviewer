import { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Code, 
  Download, 
  ChevronDown, 
  ChevronUp,
  Zap
} from 'lucide-react';
import type { CodeReview, Issue } from '../types';

interface ReviewResultProps {
  review: CodeReview | null;
  isLoading: boolean;
}

export default function ReviewResult({ review, isLoading }: ReviewResultProps) {
  const [showRefactored, setShowRefactored] = useState(false);
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());

  const toggleIssue = (index: number) => {
    setExpandedIssues(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const exportToMarkdown = () => {
    if (!review) return;

    const md = `# Code Review Report

## Summary
${review.summary}

${review.score !== undefined ? `## Score: ${review.score}/100` : ''}

## Issues Found: ${review.issues.length}

${review.issues.map((issue, idx) => `### ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.type}
${issue.description}
${issue.line ? `Line: ${issue.line}` : ''}
**Suggested Fix:** ${issue.suggested_fix}
`).join('\n')}

## Refactored Code

\`\`\`${review.language || 'javascript'}
${review.refactored_code}
\`\`\`

---
*Reviewed at: ${new Date(review.reviewed_at).toLocaleString()}*
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-review-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col animate-pulse">
        <div className="skeleton h-24 rounded-lg mb-4" />
        <div className="skeleton h-16 rounded-lg mb-3" />
        <div className="skeleton h-16 rounded-lg mb-3" />
        <div className="skeleton h-16 rounded-lg" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <Code className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Enter your code and click "Review Code" to get started</p>
        </div>
      </div>
    );
  }

  const severityCounts = {
    critical: review.issues.filter(i => i.severity === 'critical').length,
    high: review.issues.filter(i => i.severity === 'high').length,
    medium: review.issues.filter(i => i.severity === 'medium').length,
    low: review.issues.filter(i => i.severity === 'low').length,
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Summary */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">Analysis Summary</h3>
          <button
            onClick={exportToMarkdown}
            className="btn-secondary text-sm py-1 px-3 flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{typeof review.summary === 'string' ? review.summary : JSON.stringify(review.summary)}</p>
      </div>

      {/* Score */}
      {review.score !== undefined && (
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Code Quality Score:</span>
            <span className={`text-2xl font-bold ${
              review.score >= 80 ? 'text-green-500' :
              review.score >= 60 ? 'text-yellow-500' :
              review.score >= 40 ? 'text-orange-500' :
              'text-red-500'
            }`}>
              {review.score}
            </span>
            <span className="text-gray-400">/100</span>
          </div>
          
          <div className="flex items-center gap-2">
            {severityCounts.critical > 0 && (
              <span className="badge badge-critical">{severityCounts.critical} critical</span>
            )}
            {severityCounts.high > 0 && (
              <span className="badge badge-high">{severityCounts.high} high</span>
            )}
            {severityCounts.medium > 0 && (
              <span className="badge badge-medium">{severityCounts.medium} medium</span>
            )}
            {severityCounts.low > 0 && (
              <span className="badge badge-low">{severityCounts.low} low</span>
            )}
          </div>
        </div>
      )}

      {/* Issues list */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {review.issues.length === 0 ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span>No issues found! Your code looks great.</span>
          </div>
        ) : (
          review.issues.map((issue, idx) => (
            <IssueCard
              key={idx}
              issue={issue}
              isExpanded={expandedIssues.has(idx)}
              onToggle={() => toggleIssue(idx)}
            />
          ))
        )}
      </div>

      {/* Refactored code - only show when there are issues with suggested fixes */}
      {review.refactored_code && review.refactored_code.trim() !== '' && review.issues.some(issue => issue.suggested_fix && issue.suggested_fix.trim() !== '') && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowRefactored(!showRefactored)}
            className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            {showRefactored ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <Zap className="w-4 h-4" />
            {showRefactored ? 'Hide' : 'Show'} Refactored Code
          </button>
          
          {showRefactored && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-auto max-h-64">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {review.refactored_code}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface IssueCardProps {
  issue: Issue;
  isExpanded: boolean;
  onToggle: () => void;
}

function IssueCard({ issue, isExpanded, onToggle }: IssueCardProps) {
  const severityColors = {
    critical: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    high: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    low: 'border-green-500 bg-green-50 dark:bg-green-900/20',
  };

  const typeIcons = {
    bug: '🐛',
    performance: '⚡',
    readability: '📖',
    security: '🔒',
    'best-practice': '✨',
  };

  return (
    <div 
      className={`rounded-lg border-l-4 p-3 cursor-pointer transition-all ${severityColors[issue.severity]}`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeIcons[issue.type]}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`badge badge-${issue.severity}`}>{issue.severity}</span>
              <span className={`badge badge-${issue.type}`}>{issue.type}</span>
              {issue.line && (
                <span className="text-xs text-gray-500">Line {issue.line}</span>
              )}
            </div>
            <p className="text-sm font-medium mt-1">{issue.description}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Suggested Fix</p>
              <p className="text-sm mt-1">{issue.suggested_fix}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
