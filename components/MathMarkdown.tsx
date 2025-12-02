import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MathMarkdownProps {
  content: string;
}

export const MathMarkdown: React.FC<MathMarkdownProps> = ({ content }) => {
  return (
    <div className="prose prose-teal max-w-none prose-headings:text-teal-900 prose-strong:text-teal-800 prose-li:text-slate-700 text-slate-700">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};