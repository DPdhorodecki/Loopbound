create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  avatar text not null default 'kennedito',
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_idx on sessions (user_id);

create table if not exists progress (
  user_id uuid primary key references users(id) on delete cascade,
  unlocked integer not null default 1,
  tutorial_done boolean not null default false,
  muted boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists level_bests (
  user_id uuid not null references users(id) on delete cascade,
  level_id text not null,
  steps integer not null,
  cycles integer not null,
  gems integer not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, level_id)
);

create table if not exists runs (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  level_id text not null,
  level_name text,
  steps integer not null,
  cycles integer not null,
  gems integer not null,
  total_gems integer not null default 0,
  won boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists runs_user_idx on runs (user_id, created_at desc);
