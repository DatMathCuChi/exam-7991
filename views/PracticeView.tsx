import React, { useState } from 'react';
import { MathTopic, Difficulty, PracticeQuestion } from '../types';
import { generateMathProblem } from '../services/geminiService';
import { Button } from '../components/Button';
import { AlertCircle, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

export const PracticeView: React.FC = () => {
  const [topic, setTopic] = useState<MathTopic>(MathTopic.ARITHMETIC);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setQuestion(null);
    setSelectedAnswer(null);
    try {
      const data = await generateMathProblem(topic, difficulty);
      setQuestion(data);
    } catch (err) {
      setError("Không thể tạo câu hỏi lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (option: string) => {
    if (selectedAnswer) return; // Prevent changing answer
    setSelectedAnswer(option);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6 mb-6">
        <h2 className="text-2xl font-bold text-teal-900 mb-6 flex items-center gap-2">
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Cấu hình bài tập
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Chủ đề</label>
            <select 
              value={topic} 
              onChange={(e) => setTopic(e.target.value as MathTopic)}
              className="w-full rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 text-slate-700 p-2.5 bg-slate-50 border"
            >
              {(Object.values(MathTopic) as string[]).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Độ khó</label>
            <div className="flex bg-slate-100 rounded-lg p-1">
              {(Object.values(Difficulty) as string[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d as Difficulty)}
                  className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${
                    difficulty === d 
                    ? 'bg-white text-teal-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleGenerate} isLoading={loading} fullWidth>
          {question ? 'Tạo câu hỏi khác' : 'Bắt đầu luyện tập'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {question && (
        <div className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden animate-fade-in-up">
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold mb-2">
                {topic} • {difficulty}
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed">
                {question.question}
              </h3>
            </div>

            <div className="space-y-3">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === question.correctAnswer;
                const showResult = selectedAnswer !== null;

                let optionClass = "border-slate-200 hover:bg-slate-50";
                let icon = null;

                if (showResult) {
                  if (isCorrect) {
                    optionClass = "bg-green-50 border-green-200 text-green-800 ring-1 ring-green-500";
                    icon = <CheckCircle2 className="text-green-600" size={20} />;
                  } else if (isSelected) {
                    optionClass = "bg-red-50 border-red-200 text-red-800 ring-1 ring-red-500";
                    icon = <XCircle className="text-red-600" size={20} />;
                  } else {
                    optionClass = "opacity-50 border-slate-100";
                  }
                } else if (isSelected) {
                   optionClass = "border-teal-500 ring-1 ring-teal-500 bg-teal-50";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${optionClass}`}
                  >
                    <span className="font-medium text-lg">{option}</span>
                    {icon}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedAnswer && (
            <div className={`p-6 border-t ${selectedAnswer === question.correctAnswer ? 'bg-green-50 border-green-100' : 'bg-teal-50 border-teal-100'}`}>
              <h4 className="font-bold text-slate-900 mb-2">Giải thích:</h4>
              <p className="text-slate-700 leading-relaxed">{question.explanation}</p>
              
              <div className="mt-4 flex justify-end">
                <Button onClick={handleGenerate} variant="outline" size="sm">
                   Câu tiếp theo
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};