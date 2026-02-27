import { X, Trash2, Clock, AlertCircle } from 'lucide-react';
import type { HistoryItem, CodeReview } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoad: (item: { code: string; language: string; review: CodeReview }) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function HistoryPanel({ 
  history, 
  onLoad, 
  onRemove, 
  onClear, 
  onClose 
}: HistoryPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-xl h-full overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Review History
          </h2>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClear}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No review history yet</p>
              <p className="text-sm mt-1">Your reviewed code will appear here</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="card p-3 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => onLoad(item)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
                      {item.language}
                    </span>
                    {item.review.score !== undefined && (
                      <span className={`text-xs font-bold ${
                        item.review.score >= 80 ? 'text-green-500' :
                        item.review.score >= 60 ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {item.review.score}/100
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                  {typeof item.review.summary === 'string' ? item.review.summary : JSON.stringify(item.review.summary)}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{item.review.issues.length} issues</span>
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <pre className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 overflow-hidden font-mono">
                    {item.code.slice(0, 100)}...
                  </pre>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
