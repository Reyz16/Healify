import React, { useState } from 'react';
import {
  Shield,
  MessageSquare,
  FileText,
  Search,
  HelpCircle,
  Lock,
  ChevronDown,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Users,
  HeartHandshake,
} from 'lucide-react';

interface HomePageProps {
  navigate: (route: string) => void;
}

const FAQS = [
  {
    question: 'Apakah laporan saya benar-benar rahasia dan anonim?',
    answer:
      'Ya, kerahasiaan Anda adalah prioritas utama kami. Anda dapat memilih opsi "Laporan Anonim", sehingga nama dan NIM Anda tidak akan pernah disimpan di basis data. Hanya kode laporan acak dan kode akses terenkripsi yang digunakan untuk melacak perkembangan kasus.',
  },
  {
    question: 'Bagaimana cara kerja Kode Akses dan ID Laporan?',
    answer:
      'Saat Anda mengirimkan laporan, sistem akan menghasilkan ID Laporan (misal: BAC-2025-0005) dan Kode Akses acak 8 karakter. Simpan kedua kode tersebut dengan aman. Kode asli hanya ditampilkan satu kali dan disimpan dalam bentuk hash di sistem.',
  },
  {
    question: 'Berapa lama waktu yang dibutuhkan BAC untuk merespons laporan?',
    answer:
      'Laporan ditelaah dalam waktu 1x24 jam kerja. Untuk kasus berkategori darurat atau jika Anda menekan tombol "Chat Darurat" / "Eskalasi Kasus", petugas piket konselor kami akan segera mengambil tindakan prioritas tinggi.',
  },
  {
    question: 'Apa saja bentuk perundungan (bullying) yang dapat dilaporkan?',
    answer:
      'Anda dapat melaporkan Bullying Verbal (ejekan/cemoohan), Bullying Fisik (dorongan/pemukulan), Bullying Sosial (pengucilan/penyebaran rumor), Cyberbullying (pelecehan digital/media sosial), Bullying Psikologis (intimidasi mental), maupun Bullying Akademik.',
  },
  {
    question: 'Bagaimana jika saya memerlukan mediasi langsung dengan pihak kampus?',
    answer:
      'Pada menu Solusi & Tracking, Anda dapat mengajukan "Permohonan Mediator" resmi untuk mendapatkan pendampingan dari mediator berlisensi BAC dan perwakilan pimpinan jurusan.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#003B73_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-semibold text-[#003B73]">
              <Shield className="w-4 h-4 text-[#F58220]" />
              <span>Pusat Layanan & Advokasi Anti-Bullying Kampus</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#003B73] tracking-tight leading-tight">
              Binus Anti-Bullying Center
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Layanan pelaporan dan penanganan bullying yang aman, rahasia, dan profesional. Kami siap membantu Anda dengan empati dan dukungan penuh.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => navigate('/laporkan')}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-white bg-[#F58220] hover:bg-[#d96d12] shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all text-sm group"
              >
                <FileText className="w-4 h-4" />
                Laporkan Sekarang
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/chat')}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[#003B73] bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all text-sm"
              >
                <MessageSquare className="w-4 h-4 text-[#003B73]" />
                Chat Darurat
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRIVACY GUARANTEE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#003B73] to-[#00254A] text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#F58220] shrink-0">
            <Lock className="w-7 h-7" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
              Privasi Anda Terjamin
            </h3>
            <p className="text-sm text-sky-100 leading-relaxed">
              Anda dapat memilih untuk melaporkan secara anonim. Data Anda tidak akan dibagikan kepada pihak yang tidak berwenang.
            </p>
          </div>
          <button
            onClick={() => navigate('/laporkan')}
            className="shrink-0 px-5 py-2.5 rounded-xl font-semibold text-xs text-[#003B73] bg-white hover:bg-slate-100 transition shadow-sm"
          >
            Pelajari Opsi Anonim
          </button>
        </div>
      </section>

      {/* 3. CARA KERJA BAC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003B73] tracking-tight">
            Cara Kerja BAC
          </h2>
          <p className="text-sm text-slate-600">
            Proses pelaporan yang mudah dan terstruktur untuk memastikan Anda mendapatkan bantuan yang tepat
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition space-y-4 relative group">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#003B73] border border-sky-100 flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Laporkan Kejadian</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Isi formulir pelaporan dengan detail kejadian. Anda dapat memilih untuk melaporkan secara anonim.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition space-y-4 relative group">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F58220] border border-orange-100 flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Konsultasi & Pendampingan</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tim konselor kami akan menghubungi Anda dan memberikan dukungan serta solusi yang tepat.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition space-y-4 relative group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Penanganan & Resolusi</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kami akan memproses laporan Anda dengan profesional dan melakukan tindakan penanganan yang diperlukan.
            </p>
          </div>
        </div>
      </section>

      {/* 4. AKSES CEPAT (4 KARTU) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-[#003B73]">Akses Cepat</h2>
          <p className="text-sm text-slate-600">Pilih menu layanan yang Anda butuhkan</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Form Pelaporan */}
          <div
            onClick={() => navigate('/laporkan')}
            className="cursor-pointer bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-[#003B73]/40 transition group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#003B73] flex items-center justify-center group-hover:bg-[#003B73] group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Form Pelaporan</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Laporkan kejadian bullying yang Anda alami
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#003B73]">
              <span>Buka Formulir</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Chat dengan Konselor */}
          <div
            onClick={() => navigate('/chat')}
            className="cursor-pointer bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-[#003B73]/40 transition group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F58220] flex items-center justify-center group-hover:bg-[#F58220] group-hover:text-white transition-colors">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Chat dengan Konselor</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Konsultasi langsung dengan tim kami
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#003B73]">
              <span>Mulai Percakapan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Solusi & Tracking */}
          <div
            onClick={() => navigate('/solusi')}
            className="cursor-pointer bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-[#003B73]/40 transition group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Solusi & Tracking</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lihat rekomendasi dan status laporan Anda
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#003B73]">
              <span>Lacak Kasus</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: FAQ & Resources */}
          <div
            onClick={() => {
              const faqElem = document.getElementById('faq-section');
              faqElem?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cursor-pointer bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-[#003B73]/40 transition group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">FAQ & Resources</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pertanyaan umum dan sumber informasi
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#003B73]">
              <span>Baca FAQ</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ ACCORDION */}
      <section id="faq-section" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-[#003B73]">Pertanyaan Umum (FAQ)</h2>
          <p className="text-sm text-slate-600">
            Ketahui lebih banyak mengenai prosedur pelaporan dan jaminan perlindungan korban
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs transition"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm hover:text-[#003B73] transition"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#003B73]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
