"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  CheckSquare,
  BookOpen,
  Bookmark,
  TrendingUp,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/context/auth-context";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500/20">
      {/* Top Navbar */}
      <header className="h-18 border-b border-slate-800/80 px-6 sm:px-12 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Selftaught
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button size="sm">
                Ir para o Dashboard <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Criar Conta Gratuita</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-16 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" /> Estude com método e autonomia
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15] bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          A plataforma definitiva para estudantes autodidatas.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Estruture trilhas de estudo personalizadas, divida em módulos sequenciais, organize tarefas acionáveis, documente notas em Markdown e veja seu progresso em tempo real.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="shadow-lg shadow-sky-500/20 px-8 text-sm">
              Começar Agora Gratuitamente <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="border-slate-800 text-slate-300 hover:bg-slate-900 text-sm">
              Acessar Minha Conta
            </Button>
          </Link>
        </div>

        {/* Dashboard Preview Frame */}
        <div className="mt-16 w-full rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 shadow-2xl backdrop-blur-xl">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-500 ml-2 font-mono">selftaught.dev/dashboard</span>
              </div>
              <div className="flex gap-2 text-xs text-slate-400">
                <span className="text-sky-400 font-medium">● 3 Trilhas Ativas</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 font-medium">84% Concluído</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40">
                <span className="text-[10px] uppercase font-semibold text-sky-400 tracking-wider">Trilha Ativa</span>
                <h4 className="text-sm font-semibold text-slate-200 mt-1">Sistemas Distribuídos & Rust</h4>
                <div className="mt-3 flex justify-between text-xs text-slate-400">
                  <span>Módulo 3 de 5</span>
                  <span>68%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-sky-500 h-full w-[68%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40">
                <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">Próxima Tarefa</span>
                <h4 className="text-sm font-semibold text-slate-200 mt-1">Implementar Consensus Raft</h4>
                <p className="text-xs text-slate-400 mt-1">Prazo: Hoje às 18:00 • Alta Prioridade</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40">
                <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">Última Nota</span>
                <h4 className="text-sm font-semibold text-slate-200 mt-1">Teorema CAP & Consistência</h4>
                <p className="text-xs text-slate-400 mt-1">Markdown com fórmulas KaTeX</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Modules Breakdown */}
      <section className="px-6 py-20 border-t border-slate-900 max-w-7xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Módulos integrados para o ciclo completo do conhecimento
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Projetado de ponta a ponta sem ruído, sem distrações e com foco no que importa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900/40 border-slate-800/80 hover:border-sky-500/40 transition">
            <CardContent className="p-6">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Trilhas & Módulos</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Organize seus estudos em jornadas temáticas com objetivos claros, datas-alvo e módulos sequenciais ordenados.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800/80 hover:border-emerald-500/40 transition">
            <CardContent className="p-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <CheckSquare className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Gestão de Tarefas</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Prioridades, estimativas de minutos, prazos e subtarefas acionáveis diretamente vinculadas a módulos específicos.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800/80 hover:border-indigo-500/40 transition">
            <CardContent className="p-6">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Base de Conhecimento</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Editor Markdown completo para anotações técnicas, sínteses de livros, tags interconectadas e busca textual instantânea.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800/80 hover:border-amber-500/40 transition">
            <CardContent className="p-6">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Bookmark className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Curadoria de Recursos</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Salve links, artigos, livros, vídeos e cursos com categorização e rastreamento de leitura e avaliações.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800/80 hover:border-purple-500/40 transition">
            <CardContent className="p-6">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Métricas de Evolução</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Histórico de atividades automáticas, taxa de conclusão de tarefas e cálculo dinâmico de progresso.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800/80 hover:border-rose-500/40 transition">
            <CardContent className="p-6">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Privacidade & Isolamento</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Autenticação segura via JWT, isolamento estrito de dados por usuário e suporte a banco PostgreSQL ou SQLite local.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500">
        <p>Selftaught © 2026 • Plataforma de Organização de Estudos Autodidata.</p>
      </footer>
    </div>
  );
}
