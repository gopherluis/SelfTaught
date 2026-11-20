-- Migration: Full Database Schema for SelfTaught
-- Tables: users, learning_paths, modules, tasks, notes, resources, study_activities

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(1024),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

-- 2. Learning Paths Table
CREATE TABLE IF NOT EXISTS learning_paths (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'programming',
    objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    start_date DATE,
    target_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    color VARCHAR(50) NOT NULL DEFAULT 'blue',
    icon VARCHAR(50) NOT NULL DEFAULT 'BookOpen',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_learning_paths_user_id ON learning_paths (user_id);
CREATE INDEX IF NOT EXISTS ix_learning_paths_title ON learning_paths (title);
CREATE INDEX IF NOT EXISTS ix_learning_paths_category ON learning_paths (category);
CREATE INDEX IF NOT EXISTS ix_learning_paths_status ON learning_paths (status);

-- 3. Modules Table
CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(36) PRIMARY KEY,
    learning_path_id VARCHAR(36) NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'planned',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_modules_learning_path_id ON modules (learning_path_id);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id VARCHAR(36) REFERENCES learning_paths(id) ON DELETE SET NULL,
    module_id VARCHAR(36) REFERENCES modules(id) ON DELETE SET NULL,
    parent_task_id VARCHAR(36) REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    status VARCHAR(50) NOT NULL DEFAULT 'todo',
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_minutes INTEGER,
    actual_minutes INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_tasks_user_id ON tasks (user_id);
CREATE INDEX IF NOT EXISTS ix_tasks_learning_path_id ON tasks (learning_path_id);
CREATE INDEX IF NOT EXISTS ix_tasks_module_id ON tasks (module_id);
CREATE INDEX IF NOT EXISTS ix_tasks_parent_task_id ON tasks (parent_task_id);
CREATE INDEX IF NOT EXISTS ix_tasks_title ON tasks (title);
CREATE INDEX IF NOT EXISTS ix_tasks_priority ON tasks (priority);
CREATE INDEX IF NOT EXISTS ix_tasks_status ON tasks (status);

-- 5. Notes Table
CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id VARCHAR(36) REFERENCES learning_paths(id) ON DELETE SET NULL,
    module_id VARCHAR(36) REFERENCES modules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    subject VARCHAR(100) NOT NULL DEFAULT 'General',
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_notes_user_id ON notes (user_id);
CREATE INDEX IF NOT EXISTS ix_notes_learning_path_id ON notes (learning_path_id);
CREATE INDEX IF NOT EXISTS ix_notes_module_id ON notes (module_id);
CREATE INDEX IF NOT EXISTS ix_notes_title ON notes (title);
CREATE INDEX IF NOT EXISTS ix_notes_subject ON notes (subject);

-- 6. Resources Table
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id VARCHAR(36) REFERENCES learning_paths(id) ON DELETE SET NULL,
    module_id VARCHAR(36) REFERENCES modules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL DEFAULT 'article',
    is_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
    rating INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_resources_user_id ON resources (user_id);
CREATE INDEX IF NOT EXISTS ix_resources_learning_path_id ON resources (learning_path_id);
CREATE INDEX IF NOT EXISTS ix_resources_module_id ON resources (module_id);
CREATE INDEX IF NOT EXISTS ix_resources_title ON resources (title);
CREATE INDEX IF NOT EXISTS ix_resources_resource_type ON resources (resource_type);
CREATE INDEX IF NOT EXISTS ix_resources_is_reviewed ON resources (is_reviewed);

-- 7. Study Activities Table
CREATE TABLE IF NOT EXISTS study_activities (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id VARCHAR(36) REFERENCES learning_paths(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_study_activities_user_id ON study_activities (user_id);
CREATE INDEX IF NOT EXISTS ix_study_activities_learning_path_id ON study_activities (learning_path_id);
CREATE INDEX IF NOT EXISTS ix_study_activities_activity_type ON study_activities (activity_type);
CREATE INDEX IF NOT EXISTS ix_study_activities_created_at ON study_activities (created_at);
