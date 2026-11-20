"use client";

import React, { useEffect, useState } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  List as ListIcon,
  Columns as KanbanIcon,
  ChevronRight,
  ChevronDown,
  Trash2,
  Calendar,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { Task, LearningPath } from "@/types";
import { formatDate } from "@/lib/utils";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pathFilter, setPathFilter] = useState("all");

  // Create Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | "">("");
  const [selectedPathId, setSelectedPathId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Subtasks expand state
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      const [tList, pList] = await Promise.all([
        api.tasks.list({
          priority: priorityFilter !== "all" ? priorityFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          learning_path_id: pathFilter !== "all" ? pathFilter : undefined,
          search: search || undefined,
        }),
        api.paths.list(),
      ]);
      setTasks(tList);
      setPaths(pList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [priorityFilter, statusFilter, pathFilter, search]);

  const handleToggleTask = async (task: Task) => {
    const nextStatus = task.status === "completed" ? "todo" : "completed";
    try {
      await api.tasks.update(task.id, { status: nextStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.tasks.delete(taskId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.tasks.create({
        title,
        description: description || null,
        priority: priority as any,
        due_date: dueDate || null,
        estimated_minutes: estimatedMinutes ? Number(estimatedMinutes) : null,
        learning_path_id: selectedPathId || null,
        status: "todo",
      });

      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setDueDate("");
      setEstimatedMinutes("");
      setSelectedPathId("");
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubtask = async (parentId: string) => {
    const subTitle = newSubtaskTitle[parentId]?.trim();
    if (!subTitle) return;

    try {
      await api.tasks.create({
        title: subTitle,
        parent_task_id: parentId,
        priority: "medium",
        status: "todo",
      });
      setNewSubtaskTitle((prev) => ({ ...prev, [parentId]: "" }));
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <AppLayout title="Gestão de Tarefas">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Tarefas & Atividades</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gerencie suas práticas de estudo, exercícios e prazos com subtarefas
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                  viewMode === "list"
                    ? "bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-medium"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <ListIcon className="h-4 w-4" /> Lista
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                  viewMode === "kanban"
                    ? "bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-medium"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <KanbanIcon className="h-4 w-4" /> Quadro
              </button>
            </div>

            <Button onClick={() => setIsModalOpen(true)} size="sm">
              <Plus className="h-4 w-4" /> Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tarefa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Todos os Status</option>
            <option value="todo">A Fazer</option>
            <option value="in_progress">Em Progresso</option>
            <option value="completed">Concluídas</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>

          <select
            value={pathFilter}
            onChange={(e) => setPathFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 truncate"
          >
            <option value="all">Todas as Trilhas</option>
            {paths.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="Nenhuma tarefa cadastrada"
            description="Organize seus estudos criando tarefas, prazos e subtarefas acionáveis."
            actionLabel="Criar Tarefa"
            onAction={() => setIsModalOpen(true)}
          />
        ) : viewMode === "list" ? (
          /* List View */
          <div className="space-y-3">
            {tasks.map((task) => {
              const isDone = task.status === "completed";
              const isExpanded = !!expandedTasks[task.id];
              const subCount = task.subtasks?.length || 0;

              return (
                <Card key={task.id} className="p-4 transition hover:border-slate-300 dark:hover:border-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="mt-0.5 text-slate-400 hover:text-sky-500 transition shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-sm font-semibold truncate ${isDone ? "line-through text-slate-400" : ""}`}>
                            {task.title}
                          </span>
                          <Badge
                            variant={task.priority === "urgent" ? "urgent" : task.priority === "high" ? "high" : task.priority === "medium" ? "medium" : "low"}
                            className="text-[9px]"
                          >
                            {task.priority}
                          </Badge>
                          {task.learning_path_title && (
                            <Badge variant="neutral" className="text-[9px]">
                              {task.learning_path_title}
                            </Badge>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> Prazo: {formatDate(task.due_date)}
                            </span>
                          )}
                          {task.estimated_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {task.estimated_minutes} min est.
                            </span>
                          )}
                          <button
                            onClick={() => toggleExpand(task.id)}
                            className="flex items-center gap-1 text-sky-500 hover:underline"
                          >
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            {subCount} subtarefa{subCount !== 1 ? "s" : ""}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Expanded Subtasks */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 pl-8 space-y-2">
                      {task.subtasks?.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                          <span className={sub.status === "completed" ? "line-through text-slate-400" : ""}>
                            {sub.title}
                          </span>
                        </div>
                      ))}

                      {/* Add subtask input */}
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="Adicionar subtarefa..."
                          value={newSubtaskTitle[task.id] || ""}
                          onChange={(e) =>
                            setNewSubtaskTitle({ ...newSubtaskTitle, [task.id]: e.target.value })
                          }
                          onKeyDown={(e) => e.key === "Enter" && handleAddSubtask(task.id)}
                          className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <Button size="sm" variant="outline" onClick={() => handleAddSubtask(task.id)} className="h-7 px-2 text-xs">
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          /* Kanban Board View */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* Column 1: A Fazer */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/60">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  A Fazer ({tasks.filter((t) => t.status === "todo").length})
                </h3>
              </div>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === "todo")
                  .map((task) => (
                    <Card key={task.id} className="p-3 shadow-xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold">{task.title}</span>
                        <Badge variant={task.priority === "urgent" ? "urgent" : "neutral"} className="text-[9px]">
                          {task.priority}
                        </Badge>
                      </div>
                      {task.learning_path_title && (
                        <p className="text-[10px] text-slate-400 truncate">{task.learning_path_title}</p>
                      )}
                      <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                        <span>{task.due_date ? formatDate(task.due_date) : "Sem prazo"}</span>
                        <button
                          onClick={() => handleToggleTask(task)}
                          className="text-sky-500 hover:underline"
                        >
                          Concluir
                        </button>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Column 2: Em Progresso */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/60">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Em Progresso ({tasks.filter((t) => t.status === "in_progress").length})
                </h3>
              </div>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === "in_progress")
                  .map((task) => (
                    <Card key={task.id} className="p-3 shadow-xs space-y-2 border-sky-500/30">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold">{task.title}</span>
                        <Badge variant="medium" className="text-[9px]">{task.priority}</Badge>
                      </div>
                      {task.learning_path_title && (
                        <p className="text-[10px] text-slate-400 truncate">{task.learning_path_title}</p>
                      )}
                      <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                        <span>{task.due_date ? formatDate(task.due_date) : "Sem prazo"}</span>
                        <button
                          onClick={() => handleToggleTask(task)}
                          className="text-emerald-500 hover:underline"
                        >
                          Concluir
                        </button>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Column 3: Concluídas */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/60">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Concluídas ({tasks.filter((t) => t.status === "completed").length})
                </h3>
              </div>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === "completed")
                  .map((task) => (
                    <Card key={task.id} className="p-3 shadow-xs space-y-2 opacity-80">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold line-through text-slate-400">{task.title}</span>
                        <Badge variant="completed" className="text-[9px]">OK</Badge>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                        <span>{task.completed_at ? formatDate(task.completed_at) : "Concluída"}</span>
                        <button
                          onClick={() => handleToggleTask(task)}
                          className="text-slate-500 hover:underline"
                        >
                          Reabrir
                        </button>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create Task */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Nova Tarefa de Estudo"
          description="Defina uma ação concreta com prioridade e prazo."
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Título da Tarefa *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Resolver lista 2 de Álgebra Linear"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Trilha Associada (opcional)
              </label>
              <select
                value={selectedPathId}
                onChange={(e) => setSelectedPathId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Sem trilha (tarefa livre)</option>
                {paths.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
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
                  Tempo Estimado (min)
                </label>
                <input
                  type="number"
                  placeholder="45"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value ? Number(e.target.value) : "")}
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
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Descrição e Observações
              </label>
              <textarea
                rows={2}
                placeholder="Detalhes adicionais..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" loading={submitting}>
                Salvar Tarefa
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
