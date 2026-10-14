import React from 'react';
import type { AuthUser } from '../lib/supabase';
import { Lock, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  currentUser: AuthUser | null;
  navigate: (route: string) => void;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  currentUser,
  navigate,
  children,
}) => {
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Akses Terproteksi</h2>
            <p className="text-sm text-slate-600">
              Halaman ini khusus untuk konselor dan admin Binus Anti-Bullying Center. Silakan masuk terlebih dahulu untuk mengakses data laporan.
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/login')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-[#003B73] hover:bg-[#00254A] transition shadow-md"
          >
            Masuk ke Login Admin
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
