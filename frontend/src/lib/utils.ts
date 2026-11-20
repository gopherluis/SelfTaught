import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "agora há pouco";
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} d`;

    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}
