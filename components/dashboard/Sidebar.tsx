'use client';

import { lsvg } from '@/assets';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Home,
  LogOut,
  Plus,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'home', icon: Home, exact: true },
  {
    href: '/dashboard/classes',
    label: 'my_classes',
    icon: GraduationCap,
    exact: false,
  },
  { href: '/dashboard/plans', label: 'plans', icon: BookOpen, exact: false },
  {
    href: '/dashboard/assessments',
    label: 'assessments',
    icon: ClipboardList,
    exact: false,
  },
  { href: '/dashboard/profile', label: 'profile', icon: User, exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { t, isRTL } = useTranslation();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    toast.success(t('login_successful'));
    router.push('/auth/login');
  };

  return (
    <aside
      className={`hidden md:flex flex-col w-64 h-screen bg-white shrink-0 fixed top-0 z-20 overflow-y-auto ${
        isRTL
          ? 'right-0 border-l border-slate-100'
          : 'left-0 border-r border-slate-100'
      }`}
      style={{ boxShadow: '2px 0 16px 0 rgba(0,0,0,0.03)' }}
    >
      {/* ─── Logo Area ─── */}
      <div className='px-5 pt-7 pb-6'>
        <div className='flex items-center gap-2 mb-0.5'>
          <Image
            src={lsvg}
            alt='Lumina'
            width={36}
            height={30}
            className=' w-full object-contain '
          />
        </div>
        <p className='text-[11px] text-slate-400 font-medium mt-1.5 pl-12'>
          Your Classroom Co-pilot
        </p>
      </div>

      {/* ─── Primary Nav ─── */}
      <nav className='flex-1 px-3 space-y-0.5'>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-[13.5px] font-semibold transition-all duration-150 group ${
                active
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon
                size={17}
                className={`shrink-0 transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-slate-400 group-hover:text-slate-700'
                }`}
              />
              <span>{t(label)}</span>
            </Link>
          );
        })}
      </nav>

      {/* ─── Bottom Section ─── */}
      <div className='px-3 pb-6 pt-4 space-y-0.5'>
        {/* ── New Lesson Plan CTA ── */}
        <button
          onClick={() => router.push('/dashboard/plans/create')}
          className='w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-emerald-600 text-white text-[13px] font-bold hover:bg-emerald-700 active:scale-95 transition-all mb-3 cursor-pointer shadow-md shadow-emerald-100'
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('new_lesson_plan')}</span>
        </button>

        {/* ── Help ── */}
        {/* <Link
          href="#"
          className="flex items-center gap-3 px-4 py-2.5 rounded-full text-[13px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all group"
        >
          <HelpCircle
            size={17}
            className="text-slate-400 group-hover:text-slate-600 shrink-0"
          />
          <span>{t("help_center")}</span>
        </Link> */}

        {/* ── Sign Out ── */}
        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-[13px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer group'
        >
          <LogOut
            size={17}
            className='text-slate-400 group-hover:text-slate-600 shrink-0'
          />
          <span>{t('sign_out')}</span>
        </button>
      </div>
    </aside>
  );
}
