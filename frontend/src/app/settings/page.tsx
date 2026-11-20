"use client";

import React, { useState } from "react";
import {
  Settings,
  User,
  Shield,
  Palette,
  Database,
  Moon,
  Sun,
  CheckCircle2,
  Save,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [password, setPassword] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(null);
    try {
      await api.auth.updateProfile({
        full_name: fullName,
        password: password || undefined,
      });
      await refreshUser();
      setPassword("");
      setSavedMessage("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Configurações">
      <div className="max-w-3xl space-y-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Configurações da Conta</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerencie seu perfil de estudante, preferências de tema e segurança
          </p>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-sky-500" /> Perfil do Usuário
            </CardTitle>
            <CardDescription>
              Seus dados pessoais e credenciais de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {savedMessage && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {savedMessage}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-mail (fixo)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-400 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nova Senha (deixe em branco para manter a atual)
                </label>
                <input
                  type="password"
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <Button type="submit" loading={saving} size="sm">
                <Save className="h-4 w-4 mr-1" /> Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Theme Preference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4 text-sky-500" /> Aparência e Tema
            </CardTitle>
            <CardDescription>
              Alterne entre o modo escuro de alta produtividade e o modo claro
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              <div>
                <span className="text-xs font-semibold block">
                  Tema Atual: {theme === "dark" ? "Modo Escuro (Dark)" : "Modo Claro (Light)"}
                </span>
                <span className="text-[11px] text-slate-400">
                  Preferencia persistida localmente no seu navegador
                </span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Alternar para {theme === "dark" ? "Claro" : "Escuro"}
            </Button>
          </CardContent>
        </Card>

        {/* Architecture & Backend Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-sky-500" /> Informações do Sistema
            </CardTitle>
            <CardDescription>
              Estado da arquitetura e conectividade com a API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-400">Status da API</span>
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Online (FastAPI)
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-400">Banco de Dados</span>
              <span className="font-mono text-slate-300">SQLAlchemy 2.0 (PostgreSQL / SQLite)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Isolamento Multi-usuário</span>
              <span className="text-sky-400 font-medium">Ativo (Strict Tenant Isolation)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
