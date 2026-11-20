"use client";

import React, { useEffect, useState } from "react";
import {
  Bookmark,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Circle,
  Star,
  Trash2,
  Book,
  Video,
  FileText,
  Code,
  Globe,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { Resource, LearningPath } from "@/types";

const RESOURCE_TYPES = [
  { id: "all", label: "Todos os Tipos" },
  { id: "article", label: "Artigo" },
  { id: "book", label: "Livro" },
  { id: "video", label: "Vídeo" },
  { id: "course", label: "Curso" },
  { id: "doc", label: "Documentação" },
  { id: "tool", label: "Ferramenta" },
  { id: "other", label: "Outro" },
];

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [reviewedFilter, setReviewedFilter] = useState<string>("all");

  // Create Resource Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] = useState("article");
  const [selectedPathId, setSelectedPathId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [rList, pList] = await Promise.all([
        api.resources.list({
          resource_type: typeFilter !== "all" ? typeFilter : undefined,
          is_reviewed: reviewedFilter === "reviewed" ? true : reviewedFilter === "unreviewed" ? false : undefined,
          search: search || undefined,
        }),
        api.paths.list(),
      ]);
      setResources(rList);
      setPaths(pList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, reviewedFilter, search]);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.resources.create({
        title,
        url,
        description: description || null,
        resource_type: resourceType as any,
        learning_path_id: selectedPathId || null,
        is_reviewed: false,
      });

      setIsModalOpen(false);
      setTitle("");
      setUrl("");
      setDescription("");
      setSelectedPathId("");
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleReviewed = async (resource: Resource) => {
    try {
      await api.resources.update(resource.id, { is_reviewed: !resource.is_reviewed });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetRating = async (resource: Resource, rating: number) => {
    try {
      await api.resources.update(resource.id, { rating });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await api.resources.delete(resourceId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppLayout title="Recursos de Aprendizagem">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Biblioteca de Recursos</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Links, livros, vídeos e referências de alta qualidade para seus estudos
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="h-4 w-4" /> Adicionar Recurso
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título ou URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {RESOURCE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          <select
            value={reviewedFilter}
            onChange={(e) => setReviewedFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Status de Revisão (Todos)</option>
            <option value="reviewed">Apenas Revisados</option>
            <option value="unreviewed">Pendentes de Revisão</option>
          </select>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          </div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((res) => (
              <Card key={res.id} className="p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="neutral" className="text-[10px] uppercase font-bold tracking-wider">
                      {res.resource_type}
                    </Badge>
                    <button
                      onClick={() => handleToggleReviewed(res)}
                      className={`text-xs flex items-center gap-1 font-medium transition ${
                        res.is_reviewed
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                    >
                      {res.is_reviewed ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Revisado
                        </>
                      ) : (
                        <>
                          <Circle className="h-3.5 w-3.5" /> Marcar Revisado
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {res.title}
                  </h3>

                  {res.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline mt-2.5 truncate max-w-full"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{res.url}</span>
                  </a>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleSetRating(res, star)}
                        className={`p-0.5 transition ${
                          (res.rating || 0) >= star
                            ? "text-amber-400"
                            : "text-slate-300 dark:text-slate-700 hover:text-amber-300"
                        }`}
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDeleteResource(res.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="Nenhum recurso encontrado"
            description="Salve links para documentações, livros e artigos relevantes para seus estudos."
            actionLabel="Adicionar Recurso"
            onAction={() => setIsModalOpen(true)}
          />
        )}

        {/* Modal: Add Resource */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Adicionar Recurso de Estudo"
          description="Salve um link externo com descrição e categoria."
        >
          <form onSubmit={handleCreateResource} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Título do Recurso *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Documentação Oficial do React 19"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                URL / Link *
              </label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Recurso
                </label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="article">Artigo</option>
                  <option value="book">Livro</option>
                  <option value="video">Vídeo</option>
                  <option value="course">Curso</option>
                  <option value="doc">Documentação</option>
                  <option value="tool">Ferramenta</option>
                  <option value="other">Outro</option>
                </select>
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
                  <option value="">Sem trilha (geral)</option>
                  {paths.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Descrição ou Motivo da Recomendação
              </label>
              <textarea
                rows={2}
                placeholder="Por que este recurso é importante para seus estudos..."
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
                Salvar Recurso
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
