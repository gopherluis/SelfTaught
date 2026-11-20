"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  BookOpen,
  Plus,
  Search,
  Pin,
  Star,
  Trash2,
  Edit3,
  Eye,
  Save,
  Tag,
  Calendar,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { Note, LearningPath } from "@/types";
import { formatDate } from "@/lib/utils";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Edit fields
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editTagsStr, setEditTagsStr] = useState("");
  const [editPathId, setEditPathId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchNotesAndPaths = async () => {
    try {
      const [nList, pList] = await Promise.all([
        api.notes.list({
          tag: selectedTag || undefined,
          search: search || undefined,
        }),
        api.paths.list(),
      ]);
      setNotes(nList);
      setPaths(pList);

      if (nList.length > 0 && !selectedNote) {
        selectNote(nList[0]);
      } else if (selectedNote) {
        const found = nList.find((n) => n.id === selectedNote.id);
        if (found) selectNote(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesAndPaths();
  }, [selectedTag, search]);

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditSubject(note.subject);
    setEditTagsStr(note.tags.join(", "));
    setEditPathId(note.learning_path_id || "");
    setIsEditing(false);
  };

  const handleCreateNewNote = async () => {
    try {
      const created = await api.notes.create({
        title: "Nova Anotação sem Título",
        content: "# Título da Anotação\n\nComece a documentar seus aprendizados aqui usando **Markdown**.\n\n- Tópico 1\n- Tópico 2\n\n```python\nprint('Código formatado')\n```",
        subject: "Geral",
        tags: ["estudos"],
      });
      fetchNotesAndPaths();
      selectNote(created);
      setIsEditing(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    setSaving(true);
    try {
      const tags = editTagsStr
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const updated = await api.notes.update(selectedNote.id, {
        title: editTitle,
        content: editContent,
        subject: editSubject,
        tags,
        learning_path_id: editPathId || null,
      });

      setSelectedNote(updated);
      setIsEditing(false);
      fetchNotesAndPaths();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta anotação?")) return;
    try {
      await api.notes.delete(noteId);
      setSelectedNote(null);
      fetchNotesAndPaths();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.notes.update(note.id, { is_pinned: !note.is_pinned });
      fetchNotesAndPaths();
    } catch (err) {
      console.error(err);
    }
  };

  // Collect unique tags
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  );

  return (
    <AppLayout title="Base de Conhecimento">
      <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row gap-6">
        {/* Left Column: Note List */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col gap-3 shrink-0 h-full">
          {/* Header & Search */}
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold tracking-tight">Suas Anotações</h2>
            <Button size="sm" onClick={handleCreateNewNote}>
              <Plus className="h-4 w-4" /> Nova Nota
            </Button>
          </div>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar em notas e títulos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Tags Filter Bar */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] whitespace-nowrap transition ${
                  selectedTag === null
                    ? "bg-sky-600 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                Todas
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] whitespace-nowrap transition ${
                    selectedTag === t
                      ? "bg-sky-600 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {/* Notes Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
              </div>
            ) : notes.length > 0 ? (
              notes.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 text-slate-900 dark:text-slate-100 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold truncate flex-1">{note.title}</h4>
                      <button
                        onClick={(e) => handleTogglePin(note, e)}
                        className={`text-slate-400 hover:text-amber-500 transition ${note.is_pinned ? "text-amber-500" : ""}`}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {note.content.replace(/[#*`_]/g, "")}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                      <span className="truncate">{note.subject}</span>
                      <span>{formatDate(note.updated_at)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhuma anotação encontrada.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Note Editor / Markdown Viewer */}
        <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col h-full overflow-hidden">
          {selectedNote ? (
            <>
              {/* Note Action Bar */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" className="text-[10px]">
                    {selectedNote.subject}
                  </Badge>
                  {selectedNote.learning_path_title && (
                    <Badge variant="active" className="text-[10px]">
                      {selectedNote.learning_path_title}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="h-8 text-xs"
                  >
                    {isEditing ? (
                      <>
                        <Eye className="h-3.5 w-3.5 mr-1" /> Pré-visualizar
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-3.5 w-3.5 mr-1" /> Editar Markdown
                      </>
                    )}
                  </Button>

                  {isEditing && (
                    <Button
                      size="sm"
                      onClick={handleSaveNote}
                      loading={saving}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Salvar
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="h-8 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Note Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isEditing ? (
                  /* Editor Mode */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Título da Nota
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-lg font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Matéria / Assunto
                        </label>
                        <input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Trilha Vinculada
                        </label>
                        <select
                          value={editPathId}
                          onChange={(e) => setEditPathId(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        >
                          <option value="">Sem trilha (geral)</option>
                          {paths.map((p) => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Tags (separadas por vírgula)
                        </label>
                        <input
                          type="text"
                          placeholder="rust, async, concurrency"
                          value={editTagsStr}
                          onChange={(e) => setEditTagsStr(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Conteúdo em Markdown
                      </label>
                      <textarea
                        rows={16}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-4 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
                      />
                    </div>
                  </div>
                ) : (
                  /* Viewer Mode with ReactMarkdown */
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">{selectedNote.title}</h1>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>Atualizado em {formatDate(selectedNote.updated_at)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {selectedNote.tags.map((t) => (
                            <span key={t} className="text-sky-500">#{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-a:text-sky-500 prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl">
                      <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyState
                icon={BookOpen}
                title="Selecione uma anotação"
                description="Escolha uma anotação na lista lateral ou crie uma nova para documentar seu estudo."
                actionLabel="Criar Nova Anotação"
                onAction={handleCreateNewNote}
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
