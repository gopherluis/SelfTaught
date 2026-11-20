import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "active" | "completed" | "planned" | "urgent" | "high" | "medium" | "low" | "neutral";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const styles = {
    default: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/50",
    active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50",
    completed: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50",
    planned: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/50",
    urgent: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/50",
    high: "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800/50",
    medium: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/50",
    low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-colors tracking-wide",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
