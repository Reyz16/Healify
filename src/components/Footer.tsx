import React from 'react';
import { Shield, PhoneCall, Mail, ExternalLink, HeartHandshake } from 'lucide-react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#003B73] border border-sky-600/40 flex items-center justify-center text-white shadow-md">
                <Shield className="w-6 h-6 text-[#F58220]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Binus Anti-Bullying Center
                </h3>
                <p className="text-xs text-[#F58220] font-medium">Kampus Aman, Bebas Bullying</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Layanan pelaporan dan penanganan bullying yang aman, rahasia, dan profesional untuk seluruh sivitas akademika BINUS University.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <HeartHandshake className="w-4 h-4 text-[#F58220]" />
              <span>Dukungan konseling & mediasi kampus terpercaya.</span>
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Layanan
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => navigate('/laporkan')}
                  className="hover:text-white hover:underline transition text-left"
                >
                  Pelaporan Online
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/chat')}
                  className="hover:text-white hover:underline transition text-left"
                >
                  Konsultasi Chat
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/solusi')}
                  className="hover:text-white hover:underline transition text-left"
                >
                  Tracking Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/solusi')}
                  className="hover:text-white hover:underline transition text-left"
                >
                  Permohonan Mediasi Kasus
                </button>
              </li>
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Informasi
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => navigate('/#tentang')}
                  className="hover:text-white hover:underline transition text-left"
                >
                  Tentang BAC
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/#faq')}
                  className="hover:text-white hover:underline transition text-left"
                >
                  FAQ & Bantuan
                </button>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition">
                  Kebijakan Privasi & Anonimitas
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition">
                  Panduan Pelaporan Bullying
                </span>
              </li>
            </ul>
          </div>

          {/* Kontak & Hotline Darurat */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Kontak Darurat
            </h4>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="flex items-start gap-3">
                <PhoneCall className="w-5 h-5 text-[#F58220] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">Hotline Darurat (24/7):</p>
                  <a
                    href="tel:0800-BAC-HELP"
                    className="text-sm font-bold text-white hover:text-[#F58220] transition"
                  >
                    0800-BAC-HELP
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-slate-700/60">
                <Mail className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">Email Resmi:</p>
                  <a
                    href="mailto:bac@binus.ac.id"
                    className="text-xs font-semibold text-white hover:text-sky-300 transition"
                  >
                    bac@binus.ac.id
                  </a>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Lokasi: Gedung Student Advisory & Counseling Center, Seluruh Kampus BINUS.
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2025 Binus Anti-Bullying Center. All rights reserved.</p>
          <p className="text-slate-400 text-center sm:text-right">
            BINUS University · Fostering and Empowering the Society in Building and Serving the Nation.
          </p>
        </div>
      </div>
    </footer>
  );
};
