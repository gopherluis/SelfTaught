export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Module {
  id: string;
  learning_path_id: string;
  title: string;
  description?: string | null;
  objectives: string[];
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LearningPath {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  category: string;
  objectives: string[];
  status: string;
  start_date?: string | null;
  target_date?: string | null;
  completed_at?: string | null;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
  progress_percentage: number;
  modules_count: number;
  completed_modules_count: number;
  tasks_count: number;
  completed_tasks_count: number;
  modules?: Module[];
}

export interface Subtask {
  id: string;
  title: string;
  status: string;
  priority: string;
  completed_at?: string | null;
}

export interface Task {
  id: string;
  user_id: string;
  learning_path_id?: string | null;
  module_id?: string | null;
  parent_task_id?: string | null;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  due_date?: string | null;
  estimated_minutes?: number | null;
  actual_minutes?: number | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  learning_path_title?: string | null;
  module_title?: string | null;
  subtasks: Subtask[];
}

export interface Note {
  id: string;
  user_id: string;
  learning_path_id?: string | null;
  module_id?: string | null;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  is_pinned: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  learning_path_title?: string | null;
  module_title?: string | null;
}

export interface Resource {
  id: string;
  user_id: string;
  learning_path_id?: string | null;
  module_id?: string | null;
  title: string;
  url: string;
  description?: string | null;
  resource_type: "article" | "book" | "video" | "course" | "doc" | "tool" | "other";
  is_reviewed: boolean;
  rating?: number | null;
  created_at: string;
  updated_at: string;
  learning_path_title?: string | null;
  module_title?: string | null;
}

export interface ActivityItem {
  id: string;
  activity_type: string;
  learning_path_id?: string | null;
  learning_path_title?: string | null;
  metadata_json: Record<string, any>;
  created_at: string;
}

export interface DashboardStats {
  active_paths_count: int;
  completed_paths_count: int;
  total_paths_count: int;
  tasks_todo_count: int;
  tasks_in_progress_count: int;
  tasks_completed_count: int;
  tasks_overdue_count: int;
  notes_count: int;
  resources_count: int;
  resources_reviewed_count: int;
  overall_progress_percentage: number;
  study_streak_days: number;
  active_paths: LearningPath[];
  upcoming_tasks: Task[];
  recent_activities: ActivityItem[];
}
type int = number;
