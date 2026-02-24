'use client';

import React, { useState, useMemo, useCallback, ReactNode, ReactElement } from 'react';
import Editor from '@monaco-editor/react';
import { checkSolution } from '@/app/actions';
import { Loader2, CheckCircle2, XCircle, Lightbulb, RotateCcw } from 'lucide-react';

/**
 * Interface for the InteractiveTask component props.
 * Using ReactNode for children to support MDX content.
 */
interface InteractiveTaskProps {
  children: ReactNode;
  taskTitle: string;
  solution: string;
}

/**
 * Interface for the AI evaluation result object.
 */
interface EvaluationResult {
  score: number;
  isCorrect: boolean;
  feedback: string;
  hints: string[];
}

export default function InteractiveTask({ children, taskTitle, solution }: InteractiveTaskProps) {
  // --- State Management ---
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  console.log('solution', solution);
  /**
   * Recursively extracts plain text from React nodes.
   * This is essential for MDX where code blocks are wrapped in <pre><code> structures.
   */
  const extractCode = useCallback((nodes: ReactNode): string => {
    // Return string or number directly
    if (typeof nodes === 'string' || typeof nodes === 'number') {
      return String(nodes);
    }

    // Recursively process arrays of nodes
    if (Array.isArray(nodes)) {
      return nodes.map(extractCode).join('');
    }

    // Check for valid React elements and extract from their children props
    if (React.isValidElement(nodes)) {
      const element = nodes as ReactElement<{ children?: ReactNode }>;
      if (element.props.children) {
        return extractCode(element.props.children);
      }
    }

    return '';
  }, []);

  /**
   * Memoize the initial code to prevent unnecessary recalculations.
   * We trim the result to remove leading/trailing whitespace from MDX formatting.
   */
  const initialCode = useMemo(() => {
    return extractCode(children).trim();
  }, [children, extractCode]);

  // Main state for the code editor content
  const [code, setCode] = useState(initialCode);

  /**
   * Sends the current code to the Server Action for AI evaluation.
   */
  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const evaluation = await checkSolution(code, taskTitle, solution);
      setResult(evaluation);
    } catch (err) {
      setError('An error occurred during validation. Please try again.');
      console.error('Validation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resets the editor to the original code snippet.
   */
  const resetCode = () => {
    if (confirm('Are you sure you want to reset your progress?')) {
      setCode(initialCode);
      setResult(null);
    }
  };

  return (
    <div className="my-8 border border-slate-700 rounded-xl overflow-hidden bg-[#1e1e1e] shadow-2xl">
      {/* --- Editor Toolbar --- */}
      <div className="bg-[#2d2d2d] px-4 py-2.5 text-xs text-gray-400 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="font-mono opacity-80">{taskTitle.toLowerCase().replace(/\s+/g, '_')}.jsx</span>
        </div>
        <button 
          onClick={resetCode}
          className="flex items-center gap-1.5 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>
      
      {/* --- Monaco Editor Instance --- */}
      <Editor
        height="380px"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={code}
        onChange={(v) => setCode(v || '')}
        options={{
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: false,
          fontSize: 14,
          lineNumbers: 'on',
          minimap: { enabled: false },
          automaticLayout: true,
          padding: { top: 20, bottom: 20 },
          scrollBeyondLastLine: false,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        }}
      />

      {/* --- Footer Action Bar --- */}
      <div className="p-4 bg-[#1e1e1e] border-t border-slate-800 flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500 italic">
            Use the "Verify Solution" button to get AI feedback on your code.
          </p>
          {showHint && solution && (
            <p className="text-sm text-slate-500 italic">
              <Lightbulb className="inline w-4 h-4 mr-1 text-yellow-400" />
              Hint: {solution}
            </p>
          )}
        </div>
        
        <button
          onClick={() => setShowHint(true)}
          className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all shadow-lg active:scale-95"
        >
          Show hint
        </button>
        <button
          onClick={handleCheck}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg font-bold transition-all shadow-lg active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking...
            </>
          ) : (
            'Verify Solution'
          )}
        </button>
      </div>

      {/* --- AI Feedback Display --- */}
      {error && (
        <div className="p-4 bg-red-950/30 border-t border-red-900/50 text-red-400 text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {result && (
        <div className="p-6 bg-slate-900/80 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {result.isCorrect ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              ) : (
                <XCircle className="w-7 h-7 text-amber-500" />
              )}
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  Score: {result.score}/100
                </h3>
                <p className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">
                  AI Mentor Assessment
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${result.isCorrect ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
              {result.isCorrect ? 'Success' : 'Improvement Needed'}
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-slate-700 pl-4 py-1">
            {result.feedback}
          </p>

          {!result.isCorrect && result.hints?.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                <Lightbulb className="w-3 h-3" />
                Development Roadmap
              </div>
              <div className="grid gap-2">
                {result.hints.map((hint, i) => (
                  <div key={i} className="text-xs text-slate-400 bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                    <span className="text-indigo-500 mr-2">#0{i + 1}</span> {hint}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}