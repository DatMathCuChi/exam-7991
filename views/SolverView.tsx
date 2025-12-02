import React, { useState, useRef, useEffect } from 'react';
import { solveMathProblem } from '../services/geminiService';
import { Button } from '../components/Button';
import { MathMarkdown } from '../components/MathMarkdown';
import { Send, Eraser, Sparkles } from 'lucide-react';

interface SolverMessage {
  type: 'user' | 'ai';
  content: string;
}

export const SolverView: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<SolverMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const handleSolve = async () => {
    if (!input.trim()) return;

    const userMsg: SolverMessage = { type: 'user', content: input };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const solution = await solveMathProblem(userMsg.content);
    
    setHistory(prev => [...prev, { type: 'ai', content: solution }]);
    setLoading(false);
  };

  const handleClear = () => {
    setHistory([]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSolve();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-4xl mx-auto">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
            <Sparkles size={48} className="mb-4 text-teal-300" />
            <p className="text-lg">Nhập bài toán bạn cần giải vào bên dưới</p>
            <p className="text-sm">Ví dụ: "Giải phương trình x^2 - 4x + 3 = 0"</p>
          </div>
        )}

        {history.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.type === 'user' 
                  ? 'bg-teal-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-teal-100 rounded-tl-none'
              }`}
            >
              {msg.type === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <MathMarkdown content={msg.content} />
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-teal-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-teal-100">
        <div className="relative flex items-end gap-2 bg-slate-50 rounded-xl p-2 border border-slate-200 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập đề bài toán tại đây..."
            className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 py-3 px-2 text-slate-800 placeholder:text-slate-400"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          <div className="flex flex-col gap-2 pb-1">
            {history.length > 0 && (
                <button 
                onClick={handleClear}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Xóa lịch sử"
                >
                <Eraser size={20} />
                </button>
            )}
            <Button 
                onClick={handleSolve} 
                disabled={!input.trim() || loading}
                className="!p-2 !rounded-lg h-10 w-10 !flex !items-center !justify-center"
            >
                <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};