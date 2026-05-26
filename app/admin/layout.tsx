"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useActionHandler from "@/hooks/useActionHandler";

// Auth Guard Component to handle verification within the QueryClient context
function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { handleAction } = useActionHandler();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Skip protection for the login page itself
    if (pathname === "/admin") {
      setIsVerifying(false);
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    // Verify token and role
    handleAction({
      route: "/auth/me",
      type: "get",
      showToast: false,
      onSuccess: (data) => {
        if (data.user?.role !== "admin") {
          toast.error("Not authorized as admin");
          localStorage.removeItem("admin_token");
          router.push("/admin");
        } else {
          setIsVerifying(false);
        }
      },
      onError: () => {
        localStorage.removeItem("admin_token");
        router.push("/admin");
      }
    });
  }, [pathname, router]);

  if (pathname !== "/admin" && isVerifying) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FF]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#006c51] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6d7a73] font-semibold animate-pulse">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <AdminAuthGuard>
        {pathname === "/admin" ? children : <AdminLayout>{children}</AdminLayout>}
      </AdminAuthGuard>
    </QueryClientProvider>
  );
}
