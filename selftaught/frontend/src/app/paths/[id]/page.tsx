"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Bookmark,
  CheckSquare,
  Trash2,
  Edit2,
  Calendar,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { LearningPath, Module, Task, Note, Resource } from "@/types";
import { formatDate } from "@/lib/utils";

type TabType = "modules" | "tasks" | "notes" | "resources";

export default function PathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathId = params.id as string;

  const [path, setPath] = useState<LearningPath | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("modules");

  // Add module modal state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [moduleObjectivesStr, setModuleObjectivesStr] = useState("");
  const [submittingModule, setSubmittingModule] = useState(false);

  // Add task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskEstMin, setTaskEstMin] = useState<number | "">("");
  const [submittingTask, setSubmittingTask] = useState(false);

  const loadAllData = async () => {
    try {
      const p = await api.paths.get(pathId);
      setPath(p);

      const [tList, nList, rList] = await Promise.all([
        api.tasks.list({ learning_path_id: pathId }),
        api.notes.list({ learning_path_id: pathId }),
        api.resources.list({ learning_path_id: pathId }),
      ]);
      setTasks(tList);
      setNotes(nList);
      setResources(rList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [pathId]);

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingModule(true);
    try {
      const objectives = moduleObjectivesStr
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      await api.modules.create(pathId, {
        title: moduleTitle,
        description: moduleDesc || null,
        objectives,
        order_index: (path?.modules?.length || 0) + 1,
        status: "planned",
      });

      setIsModuleModalOpen(false);
      setModuleTitle("");
      setModuleDesc("");
      setModuleObjectivesStr("");
      loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingModule(false);
    }
  };

  const handleToggleModuleStatus = async (mod: Module) => {
    const nextStatus = mod.status === "completed" ? "planned" : "completed";
    try {
      await api.modules.update(mod.id, { status: nextStatus });
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Tem certeza que deseja excluir este módulo?")) return;
    try {
      await api.modules.delete(moduleId);
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTask(true);
    try {
      await api.tasks.create({
        title: taskTitle,
        priority: taskPriority as any,
        due_date: taskDueDate || null,
        estimated_minutes: taskEstMin ? Number(taskEstMin) : null,
        learning_path_id: pathId,
        status: "todo",
      });

      setIsTaskModalOpen(false);
      setTaskTitle("");
      setTaskDueDate("");
      setTaskEstMin("");
      loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const next = task.status === "completed" ? "todo" : "completed";
    try {
      await api.tasks.update(task.id, { status: next });
      loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePath = async () => {
    if (!confirm("Excluir esta trilha apagará seus módulos permanentemente. Deseja continuar?")) return;
    try {
      await api.paths.delete(pathId);
      router.push("/paths");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !path) {
    return (
      <AppLayout title="Detalhes da Trilha">
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={path.title}>
      <div className="space-y-6">
        {/* Back Link & Header Summary */}
        <div className="space-y-4">
          <Link
            href="/paths"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para todas as trilhas
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="neutral" className="uppercase text-[9px] font-bold tracking-wider">
                  {path.category}
                </Badge>
                <Badge variant={path.status === "completed" ? "completed" : path.status === "active" ? "active" : "planned"}>
                  {path.status === "completed" ? "Concluída" : path.status === "active" ? "Ativa" : "Planejada"}
                </Badge>
                {path.target_date && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Meta: {formatDate(path.target_date)}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{path.title}</h1>
              {path.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {path.description}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:items-end gap-3 min-w-[220px]">
              <div className="w-full">
                <ProgressBar value={path.progress_percentage} showLabel size="md" />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDeletePath}
                  variant="ghost"
                  size="sm"
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-4 w-4" /> Excluir Trilha
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
          <button
            onClick={() => setActiveTab("modules")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === "modules"
                ? "border-sky-500 text-sky-600 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Compass className="h-4 w-4" /> Módulos ({path.modules?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === "tasks"
                ? "border-sky-500 text-sky-600 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <CheckSquare className="h-4 w-4" /> Tarefas ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === "notes"
                ? "border-sky-500 text-sky-600 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-4 w-4" /> Anotações ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === "resources"
                ? "border-sky-500 text-sky-600 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Bookmark className="h-4 w-4" /> Recursos ({resources.length})
          </button>
        </div>

        {/* Tab 1: Modules */}
        {activeTab === "modules" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Módulos Sequenciais de Estudo</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Divida a jornada em blocos digestíveis</p>
              </div>
              <Button onClick={() => setIsModuleModalOpen(true)} size="sm">
                <Plus className="h-4 w-4" /> Adicionar Módulo
              </Button>
            </div>

            {path.modules && path.modules.length > 0 ? (
              <div className="space-y-3">
                {path.modules.map((mod, index) => {
                  const isDone = mod.status === "completed";
                  return (
                    <Card key={mod.id} className="p-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleModuleStatus(mod)}
                          className="mt-1 text-slate-400 hover:text-sky-500 transition shrink-0"
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-400">#{index + 1}</span>
                            <h4 className={`text-sm font-semibold ${isDone ? "line-through text-slate-400" : ""}`}>
                              {mod.title}
                            </h4>
                            <Badge variant={isDone ? "completed" : "planned"} className="text-[9px]">
                              {isDone ? "Concluído" : "Pendente"}
                            </Badge>
                          </div>
                          {mod.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {mod.description}
                            </p>
                          )}
                          {mod.objectives && mod.objectives.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {mod.objectives.map((obj, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300"
                                >
                                  • {obj}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        className="text-slate-400 hover:text-rose-500 transition p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Compass}
                title="Nenhum módulo adicionado"
                description="Adicione módulos para dividir esta trilha de estudo em etapas claras."
                actionLabel="Adicionar Primeiro Módulo"
                onAction={() => setIsModuleModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* Tab 2: Tasks */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Tarefas Vinculadas à Trilha</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Práticas, exercícios e entregas</p>
              </div>
              <Button onClick={() => setIsTaskModalOpen(true)} size="sm">
                <Plus className="h-4 w-4" /> Adicionar Tarefa
              </Button>
            </div>

            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Card key={task.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        className="text-slate-400 hover:text-sky-500 transition"
                      >
                        {task.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                      <span className={`text-xs font-medium ${task.status === "completed" ? "line-through text-slate-400" : ""}`}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={task.priority === "urgent" ? "urgent" : task.priority === "high" ? "high" : "neutral"} className="text-[9px]">
                        {task.priority}
                      </Badge>
                      {task.due_date && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckSquare}
                title="Nenhuma tarefa vinculada"
                description="Crie tarefas e exercícios específicos para dominar os tópicos desta trilha."
                actionLabel="Criar Tarefa"
                onAction={() => setIsTaskModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* Tab 3: Notes */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Anotações da Trilha</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Resumos técnicos e notas em Markdown</p>
              </div>
              <Link href={`/notes?path=${pathId}`}>
                <Button size="sm">
                  <Plus className="h-4 w-4" /> Criar Anotação
                </Button>
              </Link>
            </div>

            {notes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map((note) => (
                  <Link key={note.id} href={`/notes?id=${note.id}`}>
                    <Card className="p-4 hover:border-sky-500/40 transition cursor-pointer">
                      <h4 className="text-sm font-semibold">{note.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {note.content}
                      </p>
                      <div className="mt-3 flex items-center gap-1">
                        {note.tags.map((t, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="Nenhuma anotação vinculada"
                description="Documente o que está aprendendo nesta trilha para consolidar seu conhecimento."
                actionLabel="Criar Primeira Anotação"
                onAction={() => router.push(`/notes?path=${pathId}`)}
              />
            )}
          </div>
        )}

        {/* Tab 4: Resources */}
        {activeTab === "resources" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Recursos de Estudo</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Livros, links e referências complementares</p>
              </div>
              <Link href={`/resources?path=${pathId}`}>
                <Button size="sm">
                  <Plus className="h-4 w-4" /> Adicionar Recurso
                </Button>
              </Link>
            </div>

            {resources.length > 0 ? (
              <div className="space-y-2">
                {resources.map((res) => (
                  <Card key={res.id} className="p-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" className="text-[9px] uppercase">
                          {res.resource_type}
                        </Badge>
                        <h4 className="text-xs font-semibold">{res.title}</h4>
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-sky-500 hover:underline mt-1 block truncate max-w-md"
                      >
                        {res.url}
                      </a>
                    </div>
                    <Badge variant={res.is_reviewed ? "completed" : "planned"}>
                      {res.is_reviewed ? "Revisado" : "Não revisado"}
                    </Badge>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bookmark}
                title="Nenhum recurso cadastrado"
                description="Salve links para artigos, livros ou documentações essenciais desta trilha."
                actionLabel="Adicionar Recurso"
                onAction={() => router.push(`/resources?path=${pathId}`)}
              />
            )}
          </div>
        )}

        {/* Modal: Create Module */}
        <Modal
          isOpen={isModuleModalOpen}
          onClose={() => setIsModuleModalOpen(false)}
          title="Adicionar Módulo de Aprendizagem"
          description="Crie uma etapa estruturada com objetivos específicos."
        >
          <form onSubmit={handleCreateModule} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Título do Módulo *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Módulo 1: Fundamentos de Concorrência"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Descrição do Conteúdo
              </label>
              <textarea
                rows={2}
                placeholder="Tópicos que serão estudados..."
                value={moduleDesc}
                onChange={(e) => setModuleDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Objetivos do Módulo (um por linha)
              </label>
              <textarea
                rows={3}
                placeholder="Compreender threads e canais&#10;Evitar race conditions&#10;Implementar lock-free queue"
                value={moduleObjectivesStr}
                onChange={(e) => setModuleObjectivesStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModuleModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" loading={submittingModule}>
                Salvar Módulo
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Create Task for Path */}
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          title="Nova Tarefa para a Trilha"
          description="Crie uma tarefa acionável vinculada a esta jornada."
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Título da Tarefa *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Resolver lista 4 de exercícios"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Prioridade
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Estimativa (minutos)
                </label>
                <input
                  type="number"
                  placeholder="60"
                  value={taskEstMin}
                  onChange={(e) => setTaskEstMin(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Data de Entrega / Prazo
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTaskModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" loading={submittingTask}>
                Criar Tarefa
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
