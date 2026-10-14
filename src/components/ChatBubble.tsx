import React from 'react';
import type { ChatMessage } from '../types/database';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
    } catch {
      return '';
    }
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3.5 py-1.5 rounded-full max-w-md text-center shadow-xs">
          {message.body}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#003B73] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
          K
        </div>
      )}

      <div
        className={`max-w-[80%] sm:max-w-md rounded-2xl p-3.5 shadow-xs transition ${
          isUser
            ? 'bg-[#003B73] text-white rounded-tr-xs'
            : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
        }`}
      >
        {!isUser && (
          <p className="text-[11px] font-semibold text-[#003B73] mb-1">
            Konselor BAC
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
        <div
          className={`text-[10px] mt-1.5 flex items-center justify-end ${
            isUser ? 'text-sky-200' : 'text-slate-400'
          }`}
        >
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  );
};
