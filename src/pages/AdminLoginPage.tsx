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
} from 'lucide-react';
import { FormField } from '../components/FormField';
import { useToast } from '../components/Toast';
import { loginAdmin, loginWithGoogle, type AuthUser } from '../lib/supabase';

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
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

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

  const handleGoogleSignIn = async (selectedEmail: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setShowGoogleModal(false);

    try {
      const res = await loginWithGoogle(selectedEmail);
      if (res.error || !res.user) {
        setErrorMessage(res.error || 'Login Google gagal.');
      } else {
        showToast(`Berhasil masuk dengan Google: ${res.user.email}!`, 'success');
        onLoginSuccess(res.user);
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
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
        <div className="p-8 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-slate-800 text-sm shadow-xs transition hover:border-slate-400 active:scale-[0.99]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Masuk dengan Akun Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-1 pb-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-medium whitespace-nowrap">
              atau masuk dengan email
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Account Selection Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto shadow-xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Pilih Akun Google
              </h3>
              <p className="text-xs text-slate-500">
                Lanjutkan ke <strong>BINUS Anti-Bullying Center</strong>
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Account 1 */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn('reyhanz895@gmail.com')}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-slate-200 hover:border-[#003B73] hover:bg-sky-50/50 transition group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  R
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#003B73] truncate">
                    Muhammad Laksono
                  </p>
                  <p className="text-xs text-slate-500 truncate">reyhanz895@gmail.com</p>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                  Pribadi
                </span>
              </button>

              {/* Account 2 */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn('muhammad.laksono002@binus.ac.id')}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-slate-200 hover:border-[#003B73] hover:bg-sky-50/50 transition group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#003B73] text-white font-bold text-sm flex items-center justify-center shrink-0">
                  M
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#003B73] truncate">
                    Muhammad Laksono
                  </p>
                  <p className="text-xs text-slate-500 truncate">muhammad.laksono002@binus.ac.id</p>
                </div>
                <span className="text-[10px] font-semibold text-[#003B73] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100 shrink-0">
                  BINUS
                </span>
              </button>

              {/* Custom Google Account Option */}
              {showCustomGoogleInput ? (
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <input
                    type="email"
                    placeholder="nama@gmail.com atau nama@binus.ac.id"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#003B73]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(false)}
                      className="px-3 py-1 rounded-lg text-xs text-slate-600 hover:bg-slate-200"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={!customGoogleEmail.trim()}
                      onClick={() => handleGoogleSignIn(customGoogleEmail.trim())}
                      className="px-4 py-1 rounded-lg text-xs font-bold text-white bg-[#003B73] hover:bg-[#00254A] disabled:opacity-50"
                    >
                      Lanjutkan
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full py-2.5 px-3 text-left text-xs font-semibold text-slate-600 hover:text-[#003B73] hover:bg-slate-50 rounded-xl transition flex items-center gap-2"
                >
                  <span>+ Gunakan akun Google lainnya</span>
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                Aman & terverifikasi oleh Google OAuth
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowGoogleModal(false);
                  setShowCustomGoogleInput(false);
                }}
                className="px-3 py-1 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
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
