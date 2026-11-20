import { DashboardStats, LearningPath, Module, Note, Resource, Task, Token, User } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("selftaught_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  if (response.status === 401 && typeof window !== "undefined") {
    // Only redirect if not already on login/register
    if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
      localStorage.removeItem("selftaught_token");
      localStorage.removeItem("selftaught_user");
      window.location.href = "/login";
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data.detail || "Ocorreu um erro na requisição.");
  }

  return data as T;
}

export const api = {
  auth: {
    register: (body: { email: string; full_name: string; password: string }) =>
      request<Token>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request<Token>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    me: () => request<User>("/auth/me"),
    updateProfile: (body: { full_name?: string; avatar_url?: string; password?: string }) =>
      request<User>("/auth/me", { method: "PUT", body: JSON.stringify(body) }),
    logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
  },

  paths: {
    list: (params?: { status?: string; category?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append("status", params.status);
      if (params?.category) q.append("category", params.category);
      if (params?.search) q.append("search", params.search);
      const query = q.toString() ? `?${q.toString()}` : "";
      return request<LearningPath[]>(`/paths/${query}`);
    },
    get: (id: string) => request<LearningPath>(`/paths/${id}`),
    create: (body: Partial<LearningPath>) =>
      request<LearningPath>("/paths/", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<LearningPath>) =>
      request<LearningPath>(`/paths/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/paths/${id}`, { method: "DELETE" }),
  },

  modules: {
    listForPath: (pathId: string) => request<Module[]>(`/modules/path/${pathId}`),
    create: (pathId: string, body: Partial<Module>) =>
      request<Module>(`/modules/path/${pathId}`, { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Module>) =>
      request<Module>(`/modules/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/modules/${id}`, { method: "DELETE" }),
  },

  tasks: {
    list: (params?: { status?: string; priority?: string; learning_path_id?: string; module_id?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append("status", params.status);
      if (params?.priority) q.append("priority", params.priority);
      if (params?.learning_path_id) q.append("learning_path_id", params.learning_path_id);
      if (params?.module_id) q.append("module_id", params.module_id);
      if (params?.search) q.append("search", params.search);
      const query = q.toString() ? `?${q.toString()}` : "";
      return request<Task[]>(`/tasks/${query}`);
    },
    get: (id: string) => request<Task>(`/tasks/${id}`),
    create: (body: Partial<Task>) =>
      request<Task>("/tasks/", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Task>) =>
      request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
  },

  notes: {
    list: (params?: { learning_path_id?: string; subject?: string; tag?: string; search?: string; is_favorite?: boolean; is_pinned?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.learning_path_id) q.append("learning_path_id", params.learning_path_id);
      if (params?.subject) q.append("subject", params.subject);
      if (params?.tag) q.append("tag", params.tag);
      if (params?.search) q.append("search", params.search);
      if (params?.is_favorite !== undefined) q.append("is_favorite", String(params.is_favorite));
      if (params?.is_pinned !== undefined) q.append("is_pinned", String(params.is_pinned));
      const query = q.toString() ? `?${q.toString()}` : "";
      return request<Note[]>(`/notes/${query}`);
    },
    get: (id: string) => request<Note>(`/notes/${id}`),
    create: (body: Partial<Note>) =>
      request<Note>("/notes/", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Note>) =>
      request<Note>(`/notes/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/notes/${id}`, { method: "DELETE" }),
  },

  resources: {
    list: (params?: { learning_path_id?: string; resource_type?: string; is_reviewed?: boolean; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.learning_path_id) q.append("learning_path_id", params.learning_path_id);
      if (params?.resource_type) q.append("resource_type", params.resource_type);
      if (params?.is_reviewed !== undefined) q.append("is_reviewed", String(params.is_reviewed));
      if (params?.search) q.append("search", params.search);
      const query = q.toString() ? `?${q.toString()}` : "";
      return request<Resource[]>(`/resources/${query}`);
    },
    get: (id: string) => request<Resource>(`/resources/${id}`),
    create: (body: Partial<Resource>) =>
      request<Resource>("/resources/", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<Resource>) =>
      request<Resource>(`/resources/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/resources/${id}`, { method: "DELETE" }),
  },

  dashboard: {
    getStats: () => request<DashboardStats>("/dashboard/stats"),
  },
};
