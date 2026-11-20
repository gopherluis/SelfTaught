"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Compass,
  BookOpen,
  Calendar,
  Flame,
  Award,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { api } from "@/lib/api";
import { DashboardStats } from "@/types";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export default function ProgressPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.dashboard.getStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <AppLayout title="Progresso & Métricas">
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const totalTasks = (stats?.tasks_todo_count || 0) + (stats?.tasks_in_progress_count || 0) + (stats?.tasks_completed_count || 0);
  const taskCompletionRate = totalTasks > 0 ? Math.round(((stats?.tasks_completed_count || 0) / totalTasks) * 100) : 0;

  return (
    <AppLayout title="Progresso & Histórico de Estudos">
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Estatísticas de Aprendizado</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe o cumprimento de metas, consistência e registros automáticos de evolução
          </p>
        </div>

        {/* 3 Main Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                  Consistência nos Estudos
                </span>
                <Flame className="h-6 w-6 text-amber-500" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-amber-500">
                  {stats?.study_streak_days || 0}
                </span>
                <span className="text-xs text-slate-400 ml-2">dias de atividade contínua</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Pequenos passos diários geram resultados exponenciais no longo prazo.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-sky-500/10 via-transparent to-transparent border-sky-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-500">
                  Taxa de Conclusão de Tarefas
                </span>
                <CheckCircle2 className="h-6 w-6 text-sky-500" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-sky-500">
                  {taskCompletionRate}%
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  ({stats?.tasks_completed_count || 0}/{totalTasks} tarefas)
                </span>
              </div>
              <ProgressBar value={taskCompletionRate} size="sm" className="mt-3" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent border-indigo-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                  Conclusão Média das Trilhas
                </span>
                <Award className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-indigo-500">
                  {stats?.overall_progress_percentage || 0}%
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  ({stats?.completed_paths_count || 0} concluídas)
                </span>
              </div>
              <ProgressBar value={stats?.overall_progress_percentage || 0} size="sm" className="mt-3" />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Path Breakdown */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Progresso por Trilha Ativa</h3>
          <div className="space-y-3">
            {stats?.active_paths && stats.active_paths.length > 0 ? (
              stats.active_paths.map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" className="text-[9px] uppercase">
                          {p.category}
                        </Badge>
                        <h4 className="text-sm font-semibold">{p.title}</h4>
                      </div>
                      <span className="text-xs text-slate-400">
                        {p.completed_modules_count} de {p.modules_count} módulos concluídos • {p.completed_tasks_count} de {p.tasks_count} tarefas
                      </span>
                    </div>
                    <span className="text-sm font-bold text-sky-500">
                      {p.progress_percentage}%
                    </span>
                  </div>
                  <ProgressBar value={p.progress_percentage} size="sm" />
                </Card>
              ))
            ) : (
              <p className="text-xs text-slate-400">Nenhuma trilha ativa no momento.</p>
            )}
          </div>
        </div>

        {/* Full Activity Timeline */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Linha do Tempo Completa de Atividades</h3>
          <Card>
            <CardContent className="p-6">
              {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {stats.recent_activities.map((act) => (
                    <div key={act.id} className="relative flex items-start justify-between text-xs">
                      <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-sky-500" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {act.activity_type === "task_completed" && "Concluiu a tarefa:"}
                          {act.activity_type === "path_created" && "Iniciou a nova trilha:"}
                          {act.activity_type === "path_completed" && "Concluiu com sucesso a trilha:"}
                          {act.activity_type === "module_completed" && "Finalizou o módulo:"}
                          {act.activity_type === "note_created" && "Escreveu a anotação:"}
                          {act.activity_type === "resource_added" && "Adicionou o recurso:"}
                          {act.activity_type === "resource_reviewed" && "Completou a leitura do recurso:"}
                          {act.activity_type === "account_created" && "Criou conta no Selftaught"}
                          <span className="text-sky-600 dark:text-sky-400 ml-1.5 font-normal">
                            {act.metadata_json?.title || act.learning_path_title || ""}
                          </span>
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap ml-4">
                        {formatDate(act.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  Nenhuma atividade registrada no histórico ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
