'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import Sidebar from '@/components/dashboard/Sidebar';
import MobileTabBar from '@/components/dashboard/MobileTabBar';
import { DashboardDataProvider } from '@/context/DashboardDataContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isRTL } = useTranslation();
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (!user.isOnboarded) {
        router.push('/auth/profile-complete');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardDataProvider>
        <div className="min-h-screen bg-slate-50/50">
          {/* ─── Fixed Sidebar (desktop only, out of normal flow) ─── */}
          <Sidebar />

          {/* ─── Main Content: offset 256px for fixed sidebar on md+ ─── */}
          {/*     isRTL: margin-right 256px, LTR: margin-left 256px       */}
          <main
            className={`min-h-screen pb-28 md:pb-0 ${isRTL ? 'md:mr-64' : 'md:ml-64'}`}
          >
            {children}
          </main>

          {/* ─── Mobile Tab Bar (hidden on desktop) ─── */}
          <MobileTabBar />
        </div>
      </DashboardDataProvider>
    </QueryClientProvider>
  );
}

