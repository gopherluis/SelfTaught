"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  CheckSquare,
  BookOpen,
  Bookmark,
  TrendingUp,
  Plus,
  Flame,
  Clock,
  ArrowRight,
  CheckCircle2,
  Circle,
  ExternalLink,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { DashboardStats, Task, LearningPath } from "@/types";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await api.dashboard.getStats();
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleTask = async (task: Task) => {
    const nextStatus = task.status === "completed" ? "todo" : "completed";
    try {
      await api.tasks.update(task.id, { status: nextStatus });
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard de Estudos">
      <div className="space-y-8">
        {/* Quick Action Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/20 backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Visão Geral do seu Aprendizado
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Você está com <span className="text-amber-400 font-semibold">{stats?.study_streak_days || 0} dias</span> de consistência nos estudos!
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/paths">
              <Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white">
                <Plus className="h-4 w-4" /> Nova Trilha
              </Button>
            </Link>
            <Link href="/tasks">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-200">
                <Plus className="h-4 w-4" /> Nova Tarefa
              </Button>
            </Link>
            <Link href="/notes">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-200">
                <Plus className="h-4 w-4" /> Nova Anotação
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Primary Metric Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Trilhas Ativas</span>
                <div className="h-8 w-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Compass className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stats?.active_paths_count || 0}</span>
                <span className="text-xs text-slate-400">/ {stats?.total_paths_count || 0} total</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tarefas Pendentes</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckSquare className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {(stats?.tasks_todo_count || 0) + (stats?.tasks_in_progress_count || 0)}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  {stats?.tasks_completed_count || 0} concluídas
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Base de Conhecimento</span>
                <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stats?.notes_count || 0}</span>
                <span className="text-xs text-slate-400">anotações</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Progresso Geral</span>
                <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stats?.overall_progress_percentage || 0}%</span>
                <span className="text-xs text-slate-400">média</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout: Active Paths & Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Paths (2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Trilhas de Aprendizagem em Andamento</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Jornadas ativas e seu percentual de conclusão</p>
              </div>
              <Link href="/paths" className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {stats?.active_paths && stats.active_paths.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.active_paths.map((path) => (
                  <Link key={path.id} href={`/paths/${path.id}`}>
                    <Card className="hover:border-sky-500/50 hover:shadow-md transition cursor-pointer h-full flex flex-col justify-between">
                      <CardHeader className="pb-3 border-b-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge variant="neutral" className="uppercase text-[9px] font-semibold tracking-wider">
                            {path.category}
                          </Badge>
                          <Badge variant="active">Ativa</Badge>
                        </div>
                        <CardTitle className="text-sm font-semibold line-clamp-1">{path.title}</CardTitle>
                        {path.description && (
                          <CardDescription className="line-clamp-2">{path.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0 pb-4">
                        <ProgressBar value={path.progress_percentage} showLabel size="sm" />
                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{path.completed_modules_count}/{path.modules_count} módulos</span>
                          <span>{path.completed_tasks_count}/{path.tasks_count} tarefas</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Compass}
                title="Nenhuma trilha ativa"
                description="Crie sua primeira trilha de aprendizagem estruturada para acompanhar sua evolução."
                actionLabel="Criar Trilha"
                onAction={() => window.location.href = "/paths"}
              />
            )}
          </div>

          {/* Upcoming Tasks (1 column on lg) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Próximas Tarefas</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Itens com prazo ou alta prioridade</p>
              </div>
              <Link href="/tasks" className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <Card>
              <CardContent className="p-4 space-y-3">
                {stats?.upcoming_tasks && stats.upcoming_tasks.length > 0 ? (
                  stats.upcoming_tasks.map((task) => {
                    const isDone = task.status === "completed";
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                      >
                        <button
                          onClick={() => handleToggleTask(task)}
                          className="mt-0.5 text-slate-400 hover:text-sky-500 transition shrink-0"
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isDone ? "line-through text-slate-400" : ""}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            {task.priority && (
                              <Badge
                                variant={task.priority === "urgent" ? "urgent" : task.priority === "high" ? "high" : "neutral"}
                                className="text-[9px] px-1.5 py-0"
                              >
                                {task.priority}
                              </Badge>
                            )}
                            {task.due_date && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {formatDate(task.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Nenhuma tarefa pendente no momento!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Study Activity Timeline */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Histórico Recente de Estudos</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Atividades documentadas automaticamente pelo sistema</p>
            </div>
            <Link href="/progress" className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium">
              Ver histórico completo <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <Card>
            <CardContent className="p-4">
              {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {stats.recent_activities.map((act) => (
                    <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-sky-500" />
                        <div>
                          <span className="font-medium">
                            {act.activity_type === "task_completed" && "Tarefa concluída: "}
                            {act.activity_type === "path_created" && "Nova trilha iniciada: "}
                            {act.activity_type === "path_completed" && "Trilha finalizada com sucesso: "}
                            {act.activity_type === "module_completed" && "Módulo dominado: "}
                            {act.activity_type === "note_created" && "Nova anotação registrada: "}
                            {act.activity_type === "resource_added" && "Recurso de estudo adicionado: "}
                            {act.activity_type === "resource_reviewed" && "Recurso revisado: "}
                            {act.activity_type === "account_created" && "Conta criada no Selftaught"}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 ml-1">
                            {act.metadata_json?.title || act.learning_path_title || ""}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {formatRelativeTime(act.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  Nenhuma atividade registrada ainda. Crie sua primeira trilha ou anotação!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
