"use client";

import React, { useState } from "react";
import { 
  Send, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Info,
  AlertCircle,
  CheckCircle2,
  X,
  History,
  Layout
} from "lucide-react";
import useActionHandler from "@/hooks/useActionHandler";

export default function NotificationsPage() {
  const { handleAction, isLoading } = useActionHandler();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");

  const segments = [
    { id: "all", name: "All Users", icon: Users, desc: "Global broadcast" },
    { id: "active", name: "Active", icon: UserCheck, desc: "Last 30 days" },
    { id: "paid", name: "Premium", icon: TrendingUp, desc: "Pro & Ultimate" },
    { id: "free", name: "Basic", icon: Info, desc: "Free tier" },
  ];

  const handleSend = () => {
    if (!title || !message) return;
    
    handleAction({
      route: "/admin/notifications/send",
      type: "post",
      body: { title, message, target },
      successMessage: "Broadcast sent successfully!",
      onSuccess: () => {
        setTitle("");
        setMessage("");
      }
    });
  };

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface mb-1">Broadcast Center</h1>
          <p className="text-body-sm text-outline">Manage push notifications for user segments.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant text-[13px] font-bold text-outline rounded-lg hover:bg-surface-container transition-all">
          <History className="w-4 h-4" />
          Logs
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Composer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card ambient-shadow p-6 rounded-2xl space-y-6 border border-outline-variant/50 bg-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-outline uppercase tracking-widest">Select Target Segment</label>
                <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase">Targeted</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {segments.map((seg) => (
                  <button
                    key={seg.id}
                    onClick={() => setTarget(seg.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border transition-all group relative",
                      target === seg.id 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                        : "bg-[#F8F9FF] border-outline-variant/30 hover:border-primary/50 text-outline hover:text-on-surface"
                    )}
                  >
                    <seg.icon className={cn("w-5 h-5 mb-1.5", target === seg.id ? "text-white" : "group-hover:text-primary")} />
                    <p className="text-[11px] font-bold uppercase tracking-tight">{seg.name}</p>
                    {target === seg.id && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-primary rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-widest">Broadcast Title</label>
              <div className="relative">
                <Layout className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/50" />
                <input 
                  type="text" 
                  placeholder="e.g. New Lesson Plan Generator is here!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-[#F8F9FF]/50 border border-outline-variant rounded-xl outline-none focus:border-primary transition-all text-body-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-widest">Message Content</label>
              <textarea 
                rows={3}
                placeholder="Share updates with your teachers..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 bg-[#F8F9FF]/50 border border-outline-variant rounded-xl outline-none focus:border-primary transition-all text-body-sm font-medium resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-outline font-bold flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Max 240 chars recommended
                </p>
                <p className={cn("text-[10px] font-bold", message.length > 240 ? "text-error" : "text-outline")}>
                  {message.length} / 240
                </p>
              </div>
            </div>

            <button 
              onClick={handleSend}
              disabled={isLoading || !title || !message}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Dispatch Broadcast
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card ambient-shadow p-2 overflow-hidden rounded-[40px] border-[10px] border-on-surface/5 shadow-2xl bg-white aspect-[9/18.5] max-w-[260px] mx-auto hidden lg:block">
            <div className="bg-[#121212] w-full h-full rounded-[30px] p-6 relative overflow-hidden flex flex-col">
              {/* Dynamic Notification Mockup */}
              <div className="mt-8 space-y-3">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-lg">L</div>
                    <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">Lumina AI</span>
                    <span className="text-[9px] text-white/30 ml-auto">now</span>
                  </div>
                  <p className="text-[12px] font-bold text-white mb-0.5 truncate">{title || "Your Broadcast Title"}</p>
                  <p className="text-[11px] text-white/60 line-clamp-2 leading-tight">{message || "The main content of your notification will appear here."}</p>
                </div>
              </div>

              <div className="mt-auto mb-8 text-center px-4">
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Device Preview</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
            <h4 className="text-[12px] font-bold text-primary mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Best Practices
            </h4>
            <div className="space-y-3">
              {[
                "Use active voice and a clear call to action.",
                "Send at 8:00 AM for maximum teacher engagement.",
                "Verify your title fits on one line for better UX."
              ].map((tip, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-[11px] text-on-surface-variant leading-tight">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
