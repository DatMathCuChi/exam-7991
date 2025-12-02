import React from 'react';
import { AppView } from '../types';
import { Brain, Calculator, Trophy } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: AppView) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mt-10">
        <h1 className="text-4xl font-bold text-teal-900 mb-4">
          Học Toán Cùng AI
        </h1>
        <p className="text-lg text-slate-600">
          Nâng cao kỹ năng toán học của bạn với trợ lý AI thông minh. Luyện tập trắc nghiệm hoặc nhận lời giải chi tiết ngay lập tức.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
        {/* Practice Card */}
        <button
          onClick={() => onNavigate(AppView.PRACTICE)}
          className="group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-teal-100 hover:border-teal-300 text-center"
        >
          <div className="h-16 w-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Brain size={32} />
          </div>
          <h3 className="text-xl font-bold text-teal-900 mb-2">Luyện Tập</h3>
          <p className="text-slate-500">
            Thử thách bản thân với các bài tập trắc nghiệm đa dạng chủ đề và độ khó.
          </p>
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600">
            <Trophy size={20} />
          </div>
        </button>

        {/* Solver Card */}
        <button
          onClick={() => onNavigate(AppView.SOLVER)}
          className="group relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-teal-100 hover:border-teal-300 text-center"
        >
          <div className="h-16 w-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Calculator size={32} />
          </div>
          <h3 className="text-xl font-bold text-teal-900 mb-2">Giải Toán</h3>
          <p className="text-slate-500">
            Nhập đề bài toán của bạn và nhận lời giải chi tiết từng bước từ AI.
          </p>
        </button>
      </div>
      
      <div className="mt-12 p-4 bg-teal-50 rounded-lg border border-teal-200 max-w-lg text-center text-sm text-teal-800">
        <p>💡 Mẹo: Chọn "Luyện Tập" để ôn bài hoặc "Giải Toán" khi gặp bài khó!</p>
      </div>
    </div>
  );
};