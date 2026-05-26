"use client";

import { useTranslation } from "@/context/LanguageContext";
import {
  BookOpen,
  CheckSquare,
  ClipboardList,
  FileText,
  Home,
  Medal,
  Plus,
  School,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ─── Tab config (mirrors mobile app tabs — NO Classes) ───────────────
const TABS = [
  { href: "/dashboard", label: "home", icon: Home, exact: true },
  { href: "/dashboard/plans", label: "plans", icon: BookOpen, exact: false },
  {
    href: "/dashboard/assessments",
    label: "tests",
    icon: ClipboardList,
    exact: false,
  },
  { href: "/dashboard/profile", label: "profile", icon: User, exact: false },
];

// ─── FAB Quick Actions (same as mobile app) ───────────────────────────
const QUICK_ACTIONS = [
  {
    id: "class",
    label: "create_class",
    icon: School,
    href: "/dashboard/classes/create",
  },
  {
    id: "plan",
    label: "lesson_plan",
    icon: FileText,
    href: "/dashboard/plans/create",
  },
  {
    id: "test",
    label: "ca_test",
    icon: CheckSquare,
    href: "/dashboard/assessments/create-ca",
  },
  { id: "exam", label: "exams", icon: Medal, href: "/dashboard/assessments/create-exam" },
];

// ─── Arc calculation ─────────────────────────────────────────────────
const RADIUS = 130;
// Exams angle adjusted from -198 to -183 to keep it above horizontal (prevents clip)
const LTR_ANGLES = [-95, -140, -165, -190];
const RTL_ANGLES = [-85, -40, -10, 3];

function getActionPosition(index: number, isRTL: boolean, isOpen: boolean) {
  const angles = isRTL ? RTL_ANGLES : LTR_ANGLES;
  const angleDeg = angles[index];
  const angleRad = (angleDeg * Math.PI) / 175; // same divisor as mobile app
  const x = isOpen ? RADIUS * Math.cos(angleRad) : 0;
  const y = isOpen ? RADIUS * Math.sin(angleRad) : 0;
  return { x, y };
}

export default function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMenuOpen]);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ─── Backdrop overlay when menu is open ──────────────────────── */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* ─── Quarter-circle background (matches mobile pie background) ── */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed z-40 rounded-full bg-white shadow-2xl border border-slate-100"
          style={{
            width: 440,
            height: 440,
            bottom: isRTL ? 0 : 0,
            right: isRTL ? "auto" : -192,
            left: isRTL ? -192 : "auto",
            marginBottom: -192,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ─── Fan-out Quick Action Pills ───────────────────────────────── */}
      <div
        ref={overlayRef}
        className="md:hidden fixed z-50"
        style={{
          bottom: 30,
          right: isRTL ? "auto" : 24,
          left: isRTL ? 24 : "auto",
          width: 56,
          height: 56,
        }}
      >
        {QUICK_ACTIONS.map((action, index) => {
          const { x, y } = getActionPosition(index, isRTL, isMenuOpen);
          return (
            <div
              key={action.id}
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                transform: isMenuOpen
                  ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`
                  : `translate(-50%, -50%) scale(0.5)`,
                opacity: isMenuOpen ? 1 : 0,
                transition: `all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.04}s`,
                pointerEvents: isMenuOpen ? "auto" : "none",
              }}
            >
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push(action.href);
                }}
                className={`flex items-center gap-2.5 bg-white border border-slate-200 rounded-full px-3.5 py-2 shadow-md whitespace-nowrap text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <action.icon
                    size={15}
                    className="text-emerald-700"
                    strokeWidth={2}
                  />
                </span>
                <span>{t(action.label)}</span>
              </button>
            </div>
          );
        })}

        {/* ─── FAB Button ──────────────────────────────────────────────── */}
        <button
          onClick={() => setIsMenuOpen((v) => !v)}
          className="absolute inset-0 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer z-10"
          style={{
            background: isMenuOpen ? "#111827" : "#006D4E",
            boxShadow: isMenuOpen
              ? "0 8px 24px rgba(17,24,39,0.35)"
              : "0 8px 24px rgba(0,109,78,0.35)",
          }}
          aria-label="Quick actions"
        >
          <span
            className="transition-transform duration-300"
            style={{
              transform: isMenuOpen ? "rotate(135deg)" : "rotate(0deg)",
              display: "flex",
            }}
          >
            <Plus size={26} color="#ffffff" strokeWidth={2} />
          </span>
        </button>
      </div>

      {/* ─── Floating Pill Tab Bar ────────────────────────────────────── */}
      <nav
        className="md:hidden fixed z-30 flex items-center"
        style={{
          bottom: 16,
          left: isRTL ? 88 : 24,
          right: isRTL ? 24 : 88,
          height: 64,
          background: "rgba(255,255,255,0.97)",
          borderRadius: 32,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          border: "1px solid #f0fdf4",
          flexDirection: isRTL ? "row-reverse" : "row",
          paddingLeft: 6,
          paddingRight: 6,
        }}
      >
        {TABS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-center h-12 rounded-full transition-all duration-200 ${
                active ? "gap-1.5 px-4" : "flex-1"
              } ${isRTL ? "flex-row-reverse" : ""}`}
              style={{
                flex: active ? "1.7 1 0%" : "1 1 0%",
                background: active ? "#f0fdf4" : "transparent",
              }}
            >
              <Icon
                size={20}
                className={
                  active
                    ? "text-emerald-700 shrink-0"
                    : "text-slate-400 shrink-0"
                }
                strokeWidth={active ? 2.5 : 2}
              />
              {active && (
                <span className="text-[12px] font-extrabold text-emerald-700 whitespace-nowrap">
                  {t(label)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
