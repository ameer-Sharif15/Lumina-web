"use client";

import React from "react";
import { 
  Shield, 
  Bell, 
  Globe, 
  Database, 
  Cloud, 
  Lock,
  ChevronRight,
  Save
} from "lucide-react";

export default function SettingsPage() {
  const sections = [
    {
      title: "System Configuration",
      items: [
        { label: "Platform Language", desc: "Set default language for AI generation", icon: Globe, value: "English (US)" },
        { label: "Data Retention", desc: "Manage how long lesson plans are stored", icon: Database, value: "Unlimited" },
        { label: "Server Region", desc: "Current deployment target", icon: Cloud, value: "AWS - eu-west-1" },
      ]
    },
    {
      title: "Security & Access",
      items: [
        { label: "Admin Access Control", desc: "Manage secondary admin permissions", icon: Shield, value: "2 Admins" },
        { label: "Two-Factor Auth", desc: "Enforce 2FA for all admin accounts", icon: Lock, value: "Enabled" },
      ]
    },
    {
      title: "Global Notifications",
      items: [
        { label: "Push Notification Gateway", desc: "Manage Expo Server credentials", icon: Bell, value: "Configured" },
      ]
    }
  ];

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface mb-1">System Settings</h1>
          <p className="text-body-sm text-outline">Configure platform defaults and security protocols.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:shadow-lg transition-all text-[13px]">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </header>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="px-2 text-[11px] font-bold text-outline uppercase tracking-widest">{section.title}</h3>
            <div className="glass-card ambient-shadow rounded-2xl overflow-hidden border border-outline-variant/50">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-6 border-b border-outline-variant/30 last:border-0 hover:bg-surface-container/30 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="w-11 h-11 rounded-xl bg-[#F8F9FF] border border-outline-variant/50 flex items-center justify-center text-outline group-hover:text-primary group-hover:border-primary transition-all">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-on-surface">{item.label}</p>
                      <p className="text-[12px] text-outline">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[13px] font-semibold text-primary">{item.value}</span>
                    <ChevronRight className="w-4 h-4 text-outline" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-error/5 p-6 rounded-2xl border border-error/10">
        <h4 className="text-[13px] font-bold text-error mb-2">Danger Zone</h4>
        <p className="text-[12px] text-on-surface-variant mb-4">Actions here are permanent and cannot be undone. Please proceed with caution.</p>
        <button className="px-5 py-2 border border-error text-error font-bold text-[12px] rounded-lg hover:bg-error hover:text-white transition-all">
          Maintenance Mode
        </button>
      </div>
    </div>
  );
}
