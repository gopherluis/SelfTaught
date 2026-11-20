# Arquitetura do Sistema — Selftaught

## 1. Visão Geral da Arquitetura

O Selftaught foi projetado como um monorepo moderno e desacoplado, com uma API RESTful em Python FastAPI e uma Single Page Application / Server-Driven Frontend em Next.js (React + TypeScript).

```
   ┌────────────────────────────────────────────────────────┐
   │                   Frontend (Next.js)                   │
   │  App Router • Tailwind CSS • Lucide • Context API     │
   └───────────────────────────┬────────────────────────────┘
                               │ HTTP / JSON (REST)
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │                   Backend (FastAPI)                    │
   │  Auth Middleware • Pydantic v2 • Service Layer         │
   └───────────────────────────┬────────────────────────────┘
                               │ SQLAlchemy 2.0 ORM
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │                   Banco de Dados                       │
   │  PostgreSQL (Supabase) / SQLite (Dev & Testes)         │
   └────────────────────────────────────────────────────────┘
```

---

## 2. Modelo de Dados Relacional

```mermaid
erDiagram
    USERS ||--o{ LEARNING_PATHS : owns
    USERS ||--o{ TASKS : owns
    USERS ||--o{ NOTES : owns
    USERS ||--o{ RESOURCES : owns
    USERS ||--o{ STUDY_ACTIVITIES : records
    
    LEARNING_PATHS ||--o{ MODULES : contains
    LEARNING_PATHS ||--o{ TASKS : links
    LEARNING_PATHS ||--o{ NOTES : categorizes
    LEARNING_PATHS ||--o{ RESOURCES : gathers
    
    MODULES ||--o{ TASKS : organizes

    USERS {
        uuid id PK
        string email UK
        string hashed_password
        string full_name
        string avatar_url
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    LEARNING_PATHS {
        uuid id PK
        uuid user_id FK
        string title
        string description
        string category
        json objectives
        string status
        date start_date
        date target_date
        datetime completed_at
        string color
        string icon
        datetime created_at
        datetime updated_at
    }

    MODULES {
        uuid id PK
        uuid learning_path_id FK
        string title
        string description
        json objectives
        integer order_index
        string status
        datetime created_at
        datetime updated_at
    }

    TASKS {
        uuid id PK
        uuid user_id FK
        uuid learning_path_id FK
        uuid module_id FK
        uuid parent_task_id FK
        string title
        string description
        string priority
        string status
        datetime due_date
        integer estimated_minutes
        integer actual_minutes
        datetime completed_at
        datetime created_at
        datetime updated_at
    }

    NOTES {
        uuid id PK
        uuid user_id FK
        uuid learning_path_id FK
        uuid module_id FK
        string title
        text content
        string subject
        json tags
        boolean is_pinned
        boolean is_favorite
        datetime created_at
        datetime updated_at
    }

    RESOURCES {
        uuid id PK
        uuid user_id FK
        uuid learning_path_id FK
        uuid module_id FK
        string title
        string url
        string description
        string resource_type
        boolean is_reviewed
        integer rating
        datetime created_at
        datetime updated_at
    }

    STUDY_ACTIVITIES {
        uuid id PK
        uuid user_id FK
        uuid learning_path_id FK
        string activity_type
        json metadata_info
        datetime created_at
    }
```

---

## 3. Segurança e Autenticação

1. **Hash de Senha**: Utilização do algoritmo bcrypt via Passlib/Cryptography com salt dinâmico.
2. **Tokens JWT**: JSON Web Tokens assinados com HMAC-SHA256 e tempo de expiração configurável via variáveis de ambiente.
3. **Isolamento Multi-tenant Lógico**: Todas as rotas autenticadas filtram explicitamente por `user_id == current_user.id`. Tentativas de acessar ou alterar registros de outros usuários retornam erro 404 (para prevenir enumeração) ou 403.
4. **CORS**: Configuração de origens permitidas controlada via `BACKEND_CORS_ORIGINS`.

---

## 4. Estratégia de Banco de Dados

- **Suporte Duplo (SQLite & PostgreSQL)**: O projeto usa SQLAlchemy 2.0 assíncrono/síncrono com tipos padrão ANSI SQL e UUIDs representados de forma compatível tanto com o tipo nativo UUID do Postgres quanto com VARCHAR(36) no SQLite.
- **Alembic**: Gerenciamento de versões de esquema com suporte a autogenerate.
