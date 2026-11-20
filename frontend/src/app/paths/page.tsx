"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { LearningPath } from "@/types";

const CATEGORIES = [
  { id: "all", label: "Todas" },
  { id: "programming", label: "Programação" },
  { id: "math", label: "Matemática" },
  { id: "languages", label: "Idiomas" },
  { id: "science", label: "Ciências" },
  { id: "other", label: "Outros" },
];

export default function PathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pathCategory, setPathCategory] = useState("programming");
  const [objectivesStr, setObjectivesStr] = useState("");
  const [status, setStatus] = useState("active");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPaths = async () => {
    try {
      const data = await api.paths.list({
        category: category !== "all" ? category : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search ? search : undefined,
      });
      setPaths(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, [category, statusFilter, search]);

  const handleCreatePath = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const objectives = objectivesStr
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      await api.paths.create({
        title,
        description: description || null,
        category: pathCategory,
        objectives,
        status,
        target_date: targetDate || null,
        color: "sky",
        icon: "BookOpen",
      });

      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setObjectivesStr("");
      setTargetDate("");
      fetchPaths();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Trilhas de Aprendizagem">
      <div className="space-y-6">
        {/* Top Header & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Trilhas de Estudo</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estruture seus objetivos em jornadas modulares com metas bem delineadas
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="h-4 w-4" /> Criar Trilha
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  category === cat.id
                    ? "bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Paths Grid */}
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          </div>
        ) : paths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paths.map((path) => (
              <Link key={path.id} href={`/paths/${path.id}`}>
                <Card className="hover:border-sky-500/50 hover:shadow-md transition cursor-pointer flex flex-col justify-between h-full group">
                  <CardHeader className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="neutral" className="uppercase text-[9px] font-bold tracking-wider">
                        {path.category}
                      </Badge>
                      <Badge variant={path.status === "completed" ? "completed" : path.status === "active" ? "active" : "planned"}>
                        {path.status === "completed" ? "Concluída" : path.status === "active" ? "Ativa" : "Planejada"}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                      {path.title}
                    </CardTitle>
                    {path.description && (
                      <CardDescription className="line-clamp-2 mt-1">
                        {path.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4">
                    {/* Objectives snippets */}
                    {path.objectives && path.objectives.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Objetivos Principais
                        </span>
                        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                          {path.objectives.slice(0, 2).map((obj, i) => (
                            <li key={i} className="truncate flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                              <span className="truncate">{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="pt-2">
                      <ProgressBar value={path.progress_percentage} showLabel size="sm" />
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{path.completed_modules_count}/{path.modules_count} módulos</span>
                        <span>{path.completed_tasks_count}/{path.tasks_count} tarefas</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Compass}
            title="Nenhuma trilha encontrada"
            description="Não encontramos nenhuma trilha de estudo para estes filtros. Crie uma nova trilha para começar!"
            actionLabel="Criar Nova Trilha"
            onAction={() => setIsModalOpen(true)}
          />
        )}

        {/* Modal: Create Path */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Nova Trilha de Aprendizagem"
          description="Defina sua jornada de estudo autodidata com objetivos claros."
        >
          <form onSubmit={handleCreatePath} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Título da Trilha *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Rust para Sistemas Distribuídos"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Categoria
                </label>
                <select
                  value={pathCategory}
                  onChange={(e) => setPathCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="programming">Programação</option>
                  <option value="math">Matemática</option>
                  <option value="languages">Idiomas</option>
                  <option value="science">Ciências</option>
                  <option value="other">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status Inicial
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="active">Ativa</option>
                  <option value="planned">Planejada</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Descrição
              </label>
              <textarea
                rows={2}
                placeholder="Resumo do escopo, motivação ou materiais-base..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Objetivos de Aprendizagem (um por linha)
              </label>
              <textarea
                rows={3}
                placeholder="Entender ownership e lifetimes&#10;Implementar protocolo TCP básico&#10;Construir nó de consenso Raft"
                value={objectivesStr}
                onChange={(e) => setObjectivesStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Data-alvo de Conclusão (opcional)
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" loading={submitting}>
                Salvar Trilha
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
