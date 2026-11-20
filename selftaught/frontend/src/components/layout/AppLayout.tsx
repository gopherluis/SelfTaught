"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/context/auth-context";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <span className="text-xs text-slate-400 font-medium">Carregando Selftaught...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
