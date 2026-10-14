import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  AlertOctagon,
  ShieldAlert,
  Link as LinkIcon,
  CheckCircle2,
  Lock,
  Headphones,
  Info,
} from 'lucide-react';
import { ChatBubble } from '../components/ChatBubble';
import { useToast } from '../components/Toast';
import {
  getOrCreateChatSession,
  getChatMessages,
  sendChatMessage,
  escalateChatSession,
} from '../lib/supabase';
import type { ChatMessage, ChatSession } from '../types/database';

interface CounselorChatPageProps {
  navigate: (route: string) => void;
}

const QUICK_REPLIES = [
  'Saya butuh bantuan segera',
  'Bagaimana cara melaporkan?',
  'Apakah laporan saya anonim?',
];

export const CounselorChatPage: React.FC<CounselorChatPageProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reportIdInput, setReportIdInput] = useState('');
  const [isLinkingReport, setIsLinkingReport] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize or fetch active session
  useEffect(() => {
    async function initSession() {
      const sess = await getOrCreateChatSession();
      setSession(sess);
      setIsEscalated(sess.is_escalated);

      let existing = await getChatMessages(sess.id);
      if (existing.length === 0) {
        // Send initial greeting message from counselor
        const greeting = await sendChatMessage(
          sess.id,
          'konselor',
          'Halo, saya konselor dari Binus Anti-Bullying Center. Saya di sini untuk membantu Anda. Apa yang bisa saya bantu hari ini?'
        );
        existing = [greeting];
      }
      setMessages(existing);
      setTimeout(scrollToBottom, 100);
    }
    initSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Intelligent rule-based counselor response simulator
  const generateCounselorReply = async (userText: string, currentSessionId: string) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));

    let reply =
      'Terima kasih telah berbagi cerita. Anda sangat berani menyampaikan hal ini. Tim konselor kami siap mendampingi Anda melewati situasi ini dengan aman.';

    const lower = userText.toLowerCase();
    if (lower.includes('segera') || lower.includes('darurat') || lower.includes('tolong') || lower.includes('ancaman')) {
      reply =
        'Saya mengerti situasi ini sangat mendesak. Jika Anda merasa keselamatan fisik Anda terancam saat ini, Anda dapat menekan tombol "Eskalasi Kasus" di atas atau menghubungi Hotline Darurat 24/7 kami di 0800-BAC-HELP.';
    } else if (lower.includes('cara') || lower.includes('lapor') || lower.includes('formulir')) {
      reply =
        'Untuk membuat laporan resmi, silakan buka menu "Form Pelaporan". Di sana Anda bisa menceritakan kejadian dan melampirkan bukti. Anda juga bebas memilih untuk melapor secara anonim tanpa mencantumkan identitas.';
    } else if (lower.includes('anonim') || lower.includes('rahasia') || lower.includes('nama')) {
      reply =
        'Benar sekali. Kerahasiaan Anda dijamin 100%. Pada formulir laporan terdapat opsi "Laporan Anonim", di mana nama dan NIM Anda tidak diminta dan tidak akan pernah disimpan di server kami.';
    } else if (lower.includes('selesai') || lower.includes('terima kasih') || lower.includes('makasih')) {
      reply =
        'Sama-sama. Ingat bahwa Anda tidak sendirian di kampus BINUS. Kami selalu ada di sini jika Anda membutuhkan bantuan lebih lanjut. Tetap jaga diri Anda ya!';
    }

    const counselorMsg = await sendChatMessage(currentSessionId, 'konselor', reply);
    setMessages((prev) => [...prev, counselorMsg]);
    setIsTyping(false);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !session) return;

    setInputText('');
    const userMsg = await sendChatMessage(session.id, 'user', text.trim());
    setMessages((prev) => [...prev, userMsg]);

    generateCounselorReply(text.trim(), session.id);
  };

  const handleEscalation = async () => {
    if (!session) return;
    try {
      await escalateChatSession(session.id);
      setIsEscalated(true);
      const updatedMessages = await getChatMessages(session.id);
      setMessages(updatedMessages);
      showToast('Kasus berhasil dieskalasi dengan prioritas tinggi.', 'info');
    } catch {
      showToast('Gagal mengeskalasi kasus.', 'error');
    }
  };

  const handleLinkReport = async () => {
    if (!reportIdInput.trim() || !session) return;
    try {
      session.report_id = reportIdInput.trim().toUpperCase();
      setIsLinkingReport(false);
      showToast(`Sesi chat berhasil ditautkan ke laporan ${session.report_id}.`, 'success');
      await sendChatMessage(
        session.id,
        'system',
        `Sesi percakapan ditautkan ke Nomor Laporan: ${session.report_id}`
      );
      const updatedMessages = await getChatMessages(session.id);
      setMessages(updatedMessages);
    } catch {
      showToast('Gagal menautkan laporan.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      {/* Chat Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col h-[78vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#003B73] to-[#00254A] text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-base text-[#F58220]">
                K
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#003B73] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white leading-tight">Konselor BAC</h2>
                {isEscalated && (
                  <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase">
                    Eskalasi Prioritas
                  </span>
                )}
              </div>
              <p className="text-xs text-sky-200 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Online · Layanan Konseling & Bantuan Segera
              </p>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLinkingReport(!isLinkingReport)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{session?.report_id ? `Laporan: ${session.report_id}` : 'Tautkan ID Laporan'}</span>
            </button>

            <button
              onClick={handleEscalation}
              disabled={isEscalated}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                isEscalated
                  ? 'bg-rose-900/60 text-rose-200 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{isEscalated ? 'Kasus Dieskalasi' : 'Eskalasi Kasus'}</span>
            </button>
          </div>
        </div>

        {/* Link Report Bar (Collapsible) */}
        {isLinkingReport && (
          <div className="bg-sky-50 px-6 py-3 border-b border-sky-100 flex items-center gap-3 animate-in slide-in-from-top-1">
            <span className="text-xs text-sky-900 font-semibold shrink-0">
              ID Laporan Kasus:
            </span>
            <input
              type="text"
              placeholder="Contoh: BAC-2025-0001"
              value={reportIdInput}
              onChange={(e) => setReportIdInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-sky-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003B73]"
            />
            <button
              onClick={handleLinkReport}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#003B73] text-white hover:bg-[#00254A] transition"
            >
              Tautkan
            </button>
          </div>
        )}

        {/* Privacy Note strip */}
        <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-400" />
            Percakapan ini bersifat rahasia dan terlindungi dalam lingkungan konseling BINUS BAC.
          </span>
          <button
            onClick={() => navigate('/laporkan')}
            className="text-[#003B73] font-semibold hover:underline shrink-0"
          >
            Form Pelaporan Resmi
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 bg-slate-50/50">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mb-4 items-center">
              <div className="w-8 h-8 rounded-full bg-[#003B73] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                K
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-xs flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium mr-1">Konselor sedang mengetik</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#003B73] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#003B73] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#003B73] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium shrink-0">Pilihan cepat:</span>
          {QUICK_REPLIES.map((replyText) => (
            <button
              key={replyText}
              type="button"
              onClick={() => handleSend(replyText)}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#003B73] border border-slate-200/80 transition shrink-0 whitespace-nowrap"
            >
              {replyText}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ketik pesan Anda..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 rounded-xl bg-[#003B73] hover:bg-[#00254A] text-white disabled:opacity-40 transition shadow-sm shrink-0"
              aria-label="Kirim pesan"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
