/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastProvider } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { ReportFormPage } from './pages/ReportFormPage';
import { CounselorChatPage } from './pages/CounselorChatPage';
import { SolutionTrackingPage } from './pages/SolutionTrackingPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminReportDetailPage } from './pages/AdminReportDetailPage';

// Supabase and Database layer
import { getCurrentAdmin, logoutAdmin, initLocalDatabase, type AuthUser } from './lib/supabase';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentAdmin());

  // Transient state for tracking pre-fill from report creation
  const [trackReportCode, setTrackReportCode] = useState('');
  const [trackAccessCode, setTrackAccessCode] = useState('');

  // Initialize DB once on start
  useEffect(() => {
    initLocalDatabase();
  }, []);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setCurrentUser(null);
    navigate('/');
  };

  const handleSetTrackCodes = (repCode: string, accCode: string) => {
    setTrackReportCode(repCode);
    setTrackAccessCode(accCode);
  };

  // Render view according to current route
  const renderCurrentView = () => {
    // 1. Home
    if (currentRoute === '/' || currentRoute === '') {
      return <HomePage navigate={navigate} />;
    }

    // 2. Report Form
    if (currentRoute === '/laporkan') {
      return (
        <ReportFormPage
          navigate={navigate}
          onSetTrackCodes={handleSetTrackCodes}
        />
      );
    }

    // 3. Counselor Chat
    if (currentRoute === '/chat') {
      return <CounselorChatPage navigate={navigate} />;
    }

    // 4. Solution & Tracking
    if (currentRoute === '/solusi') {
      return (
        <SolutionTrackingPage
          navigate={navigate}
          defaultReportCode={trackReportCode}
          defaultAccessCode={trackAccessCode}
        />
      );
    }

    // 5. Admin Login
    if (currentRoute === '/admin/login') {
      return (
        <AdminLoginPage
          navigate={navigate}
          onLoginSuccess={(user) => setCurrentUser(user)}
        />
      );
    }

    // 6. Admin Report Detail (/admin/laporan/:id)
    if (currentRoute.startsWith('/admin/laporan/')) {
      const id = currentRoute.replace('/admin/laporan/', '');
      return (
        <ProtectedRoute currentUser={currentUser} navigate={navigate}>
          <AdminReportDetailPage
            reportId={id}
            navigate={navigate}
            currentUser={currentUser!}
          />
        </ProtectedRoute>
      );
    }

    // 7. Admin Dashboard (/admin/dashboard or /admin)
    if (currentRoute.startsWith('/admin')) {
      return (
        <ProtectedRoute currentUser={currentUser} navigate={navigate}>
          <AdminDashboardPage navigate={navigate} currentUser={currentUser!} />
        </ProtectedRoute>
      );
    }

    // Fallback: Home
    return <HomePage navigate={navigate} />;
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#F58220]/20 selection:text-[#003B73]">
        <Navbar
          currentRoute={currentRoute}
          navigate={navigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1">{renderCurrentView()}</main>

        <Footer navigate={navigate} />
      </div>
    </ToastProvider>
  );
}
