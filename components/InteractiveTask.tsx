'use client'

import Editor from '@monaco-editor/react';
import { useState } from 'react';
import { checkSolution } from '@/app/actions';

export default function InteractiveTask({ taskTitle, initialCode, solution }: any) {
  const [code, setCode] = useState(initialCode);
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const result = await checkSolution(code, taskTitle, solution);
      setReview(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-8 border rounded-xl overflow-hidden shadow-xl bg-[#1e1e1e]">
      <Editor
        height="350px"
        defaultLanguage="javascript"
        theme="light"
        value={code}
        onChange={(val) => setCode(val || '')}
        options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
      />
      <div className="p-6 bg-white border-t">
        <button 
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {loading ? 'AI Reviewing...' : 'Check Solution with AI'}
        </button>

        {review && (
          <div className={`mt-6 p-5 rounded-lg border-2 ${review.isCorrect ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold">Score: {review.score}/100</h3>
              <span className="text-2xl">{review.isCorrect ? '🎉' : '💡'}</span>
            </div>
            <p className="text-gray-800 font-medium mb-4">{review.feedback}</p>
            {review.hints.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Hints:</p>
                {review.hints.map((h: string, i: number) => (
                  <div key={i} className="flex gap-2 text-sm text-gray-700">
                    <span>•</span> {h}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}