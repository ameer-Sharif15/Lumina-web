"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  HelpCircle,
  FileText,
  Bell,
  MessageSquare,
  Gift,
  Send
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Teachers", href: "/admin/teachers", icon: Users },
  { name: "Lessons", href: "/admin/lessons", icon: FolderOpen },
  { name: "Referrals", href: "/admin/referrals", icon: Gift },
  { name: "Broadcasts", href: "/admin/notifications", icon: Send },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("admin_user");
    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse admin user");
      }
    }
  }, []);

  return (
    <div className="flex h-screen bg-[#F8F9FF] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-outline-variant flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-on-surface leading-tight tracking-tight">Lumina</h1>
              <p className="text-[9px] font-bold text-outline uppercase tracking-[0.1em]">Admin Portal</p>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Main Menu</p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group",
                    isActive 
                      ? "bg-primary/5 text-primary font-bold" 
                      : "text-outline hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  <item.icon className={cn("w-4.5 h-4.5", isActive ? "text-primary" : "text-outline group-hover:text-on-surface")} />
                  <span className="text-[13px]">{item.name}</span>
                  {isActive && <div className="ml-auto w-1 h-1 bg-primary rounded-full" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="bg-[#F8F9FF] p-4 rounded-xl border border-outline-variant/50">
            <p className="text-[11px] font-bold text-on-surface mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <p className="text-[10px] text-outline">All systems operational</p>
            </div>
          </div>

          <div className="space-y-0.5">
            <Link href="/admin/support" className="flex items-center gap-3 px-4 py-2 text-outline hover:text-on-surface transition-colors">
              <HelpCircle className="w-4.5 h-4.5" />
              <span className="text-[13px]">Support</span>
            </Link>
            <button 
              onClick={() => {
                localStorage.removeItem("admin_token");
                localStorage.removeItem("admin_user");
                window.location.href = "/admin";
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-outline hover:text-error transition-colors"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span className="text-[13px]">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-body-sm font-bold text-on-surface">
              {pathname.split('/').pop()?.replace(/^\w/, c => c.toUpperCase()) || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 pr-4 border-r border-outline-variant">
              <button className="p-2 text-outline hover:bg-surface-container rounded-full transition-all relative">
                <Bell className="w-5 h-5" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white" />
              </button>
              <button className="p-2 text-outline hover:bg-surface-container rounded-full transition-all">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
            
            <Link href="/admin/profile" className="flex items-center gap-3 hover:bg-surface-container p-1.5 pr-3 rounded-full transition-all group">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-secondary-container flex items-center justify-center font-bold text-primary text-xs shadow-sm">
                {adminUser?.personal?.profilePhoto ? (
                  <img src={adminUser.personal.profilePhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  adminUser?.fullName?.charAt(0) || "A"
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[12px] font-bold text-on-surface leading-none mb-0.5">{adminUser?.fullName || "Admin"}</p>
                <p className="text-[10px] text-outline leading-none">System Administrator</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
