create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null default '', phone text not null default '',
  loc text not null default '', bio text not null default '',
  pw_hash text not null,
  otp_secret text, otp_pending text, pk_hash text,
  theme text not null default 'system' check (theme in ('system','light','dark')),
  size text not null default 'md' check (size in ('sm','md','lg')),
  def_vis text not null default 'private' check (def_vis in ('public','private')),
  mask boolean not null default false,
  created_at timestamptz not null default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users on delete cascade,
  device text, browser text, ip text,
  created_at timestamptz not null default now(),
  last_active timestamptz not null default now(),
  revoked boolean not null default false
);

create table items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users on delete cascade,
  kind text not null check (kind in ('todo','task')),
  title text not null,
  priority text not null default 'med' check (priority in ('high','med','low')),
  status text not null default 'todo' check (status in ('todo','doing','done')),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table subitems (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items on delete cascade,
  user_id uuid not null references users on delete cascade,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users on delete cascade,
  title text not null, mood text not null, body text not null,
  created_at timestamptz not null default now()
);

create table files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users on delete cascade,
  name text not null, size int not null, type text not null,
  visibility text not null default 'private' check (visibility in ('public','private')),
  data bytea not null,
  created_at timestamptz not null default now()
);

create index on items (user_id, kind, created_at desc);
create index on subitems (item_id);
create index on journal (user_id, created_at desc);
create index on files (user_id, created_at desc);
create index on sessions (user_id);
