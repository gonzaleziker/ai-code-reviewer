import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export default function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const { theme } = useTheme();

  const handleChange = (newValue: string | undefined) => {
    onChange(newValue || '');
  };

  return (
    <div className="monaco-container h-full">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={handleChange}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
