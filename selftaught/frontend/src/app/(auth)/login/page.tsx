"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.auth.login({ email, password });
      login(res.access_token, res.user);
      router.push("/dashboard");
    } catch (err: any) {
      // Normalizar mensagem de erro para string
      let message = "";
      if (err?.detail) {
        if (typeof err.detail === "string") {
          message = err.detail;
        } else if (Array.isArray(err.detail) && err.detail[0]?.msg) {
          message = err.detail[0].msg;
        } else {
          // Converte objeto de erro para texto legível
          try {
            message = JSON.stringify(err.detail);
          } catch (_) {
            message = "Erro inesperado.";
          }
        }
      } else {
        message = "Erro ao efetuar login. Verifique seu e-mail e senha.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Selftaught</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white">Bem-vindo de volta</h2>
          <p className="text-xs text-slate-400 mt-1">Acesse sua jornada de aprendizagem independente</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur-md">
          {error && (
            <div className="p-3 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="exemplo@selftaught.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" size="md">
              Entrar no Selftaught <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Ainda não tem conta?{" "}
            <Link href="/register" className="text-sky-400 hover:text-sky-300 font-medium">
              Criar conta gratuita
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
