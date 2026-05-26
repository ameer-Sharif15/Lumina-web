"use client";
import useActionHandler from "@/hooks/useActionHandler";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleAction, isLoading } = useActionHandler();

  // Redirect if already logged in
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("admin_token")) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction({
      route: "/auth/login",
      type: "post",
      body: { email, password },
      successMessage: "Welcome back, Admin!",
      onSuccess: (data) => {
        // Double check role if possible, or just trust the token for now
        // Usually, the login response should contain user info
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        router.push("/admin/dashboard");
      },
    });
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-surface-tint/5 blur-[80px]" />

      <div className="relative z-10 w-full max-w-[440px] px-6">
        <div className="glass-card ambient-shadow rounded-lg p-10 flex flex-col items-center">
          {/* Logo Section */}
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-3xl">
              admin_panel_settings
            </span>
          </div>

          <h1 className="text-display-lg text-on-surface mb-1 font-display-lg">
            Lumina
          </h1>
          <p className="text-body-sm text-outline mb-8">Admin Portal</p>

          {/* Form */}
          <form className="w-full space-y-5" onSubmit={onLogin}>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">
                mail
              </span>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[54px] pl-12 pr-4 bg-transparent border border-outline-variant rounded-md text-body-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-outline/50"
                required
                disabled={isLoading}
              />
            </div>

            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[54px] pl-12 pr-12 bg-transparent border border-outline-variant rounded-md text-body-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-outline/50"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors flex items-center justify-center"
                disabled={isLoading}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative w-4 h-4">
                  <input
                    type="checkbox"
                    className="peer absolute opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="w-4 h-4 border border-outline-variant rounded-sm bg-transparent peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[12px] opacity-0 peer-checked:opacity-100 font-bold">
                      check
                    </span>
                  </div>
                </div>
                <span className="text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/admin/forgot-password"
                className="text-body-sm font-semibold text-primary hover:text-primary-container transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[56px] bg-primary text-on-primary rounded-full font-semibold text-body-base hover:bg-primary-container hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login to Admin Portal"}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-label-caps text-outline flex items-center justify-center gap-2">
            Secure connection established. v2.4.1
          </p>
        </div>
      </div>
    </main>
  );
}
