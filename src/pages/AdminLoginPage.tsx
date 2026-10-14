import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  HelpCircle,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { FormField } from '../components/FormField';
import { useToast } from '../components/Toast';
import { loginAdmin, DEMO_ADMIN, type AuthUser } from '../lib/supabase';

interface AdminLoginPageProps {
  navigate: (route: string) => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  navigate,
  onLoginSuccess,
}) => {
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Mohon masukkan email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginAdmin(email.trim(), password);
      if (res.error || !res.user) {
        setErrorMessage(res.error || 'Autentikasi gagal.');
      } else {
        showToast(`Selamat datang, ${res.user.name}!`, 'success');
        onLoginSuccess(res.user);
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
    setErrorMessage(null);
    showToast('Kredensial Admin Demo telah diisikan!', 'info');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#003B73] to-[#00254A] p-8 text-center text-white space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#F58220] mx-auto shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Login Petugas BAC</h1>
            <p className="text-xs text-sky-200 mt-1">
              Portal Manajemen & Penanganan Kasus Bullying Kampus
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Email Petugas / Admin BAC" required>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin.bac@binus.ac.id"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </FormField>

            <FormField label="Kata Sandi" required>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Tampilkan atau sembunyikan sandi"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[#003B73] hover:underline font-semibold"
              >
                Lupa password?
              </button>
              <span className="text-slate-400">Khusus staf terverifikasi</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[#003B73] hover:bg-[#00254A] transition shadow-md shadow-sky-950/10 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Account Helper for Reviewer / Test */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  Akun Demo Admin (Siap Pakai):
                </span>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="font-bold text-[11px] text-[#003B73] hover:underline bg-white px-2 py-0.5 rounded border border-amber-200 shadow-2xs"
                >
                  Gunakan Akun Ini
                </button>
              </div>
              <div className="text-[11px] font-mono text-slate-700 space-y-0.5">
                <div>Email: <strong className="text-slate-900">{DEMO_ADMIN.email}</strong></div>
                <div>Pass : <strong className="text-slate-900">{DEMO_ADMIN.password}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#003B73] flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Pemulihan Akun Staf BAC</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Untuk menjaga integritas data kasus pelaporan rahasia, reset kata sandi staf dan konselor hanya dapat dilakukan melalui Administrator Sistem IT BINUS University atau Dashboard Supabase Auth resmi.
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Hubungi IT Helpdesk: it.support@binus.edu
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
