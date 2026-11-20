import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "Selftaught — Plataforma de Aprendizagem Autodidata",
  description:
    "Organize suas trilhas de estudo, documente conhecimento com Markdown, gerencie tarefas e acompanhe seu progresso de forma visual e intuitiva.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-sky-500/20">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
