create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  nome text not null,
  criado_em timestamp with time zone default now()
);

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  titulo text not null,
  concluido boolean default false,
  criado_em timestamp with time zone default now()
);