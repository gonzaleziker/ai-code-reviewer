import { useState, useCallback } from 'react';
import { Sparkles, Moon, Sun, History, X, Loader2 } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useHistory } from './hooks/useHistory';
import { api } from './services/api';
import CodeEditor from './components/CodeEditor';
import ReviewResult from './components/ReviewResult';
import HistoryPanel from './components/HistoryPanel';
import type { CodeReview, ReviewRequest } from './types';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { history, addToHistory, removeFromHistory, clearHistory } = useHistory();
  
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [strictMode, setStrictMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<CodeReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleReview = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code to review');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReview(null);

    try {
      const request: ReviewRequest = { code, language, strictMode };
      const response = await api.reviewCode(request);
      
      if (response.success && response.data) {
        setReview(response.data);
        addToHistory(code, language, response.data);
      } else {
        setError(response.error || 'Review failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [code, language, strictMode, addToHistory]);

  const handleClear = useCallback(() => {
    setCode('');
    setReview(null);
    setError(null);
  }, []);

  const handleLoadFromHistory = useCallback((item: { code: string; language: string; review: CodeReview }) => {
    setCode(item.code);
    setLanguage(item.language);
    setReview(item.review);
    setShowHistory(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Code Reviewer
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Local AI-powered code analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn-secondary flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
              {history.length > 0 && (
                <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {history.length}
                </span>
              )}
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor panel */}
          <div className="card p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Code Editor</h2>
              <div className="flex items-center gap-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input py-1.5 text-sm w-40"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="ruby">Ruby</option>
                  <option value="php">PHP</option>
                </select>

                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={strictMode}
                    onChange={(e) => setStrictMode(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Strict Mode
                </label>
              </div>
            </div>

            <div className="flex-1 min-h-[400px] mb-4">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {code.split('\n').length} lines
              </span>
              
              <div className="flex items-center gap-3">
                {code && (
                  <button
                    onClick={handleClear}
                    className="btn-secondary min-w-[100px] flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
                
                <button
                  onClick={handleReview}
                  disabled={isLoading || !code.trim()}
                  className="btn-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Review Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Review result panel */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">Review Result</h2>
            <ReviewResult review={review} isLoading={isLoading} />
          </div>
        </div>
      </main>

      {/* History panel */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onLoad={handleLoadFromHistory}
          onRemove={removeFromHistory}
          onClear={clearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

export default App;
