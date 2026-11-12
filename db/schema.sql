
create schema if not exists impeto;

create table if not exists impeto.members (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  password_hash text,
  admin boolean not null default false
);
create unique index if not exists impeto_local_email on impeto.members(lower(email)) where password_hash is not null;
create table if not exists impeto.sessions (
  token_hash text primary key,
  member_id uuid not null references impeto.members(id) on delete cascade,
  expires_at timestamptz not null
);
create index if not exists impeto_sessions_expiry on impeto.sessions(expires_at);
create table if not exists impeto.auth_limits (
  bucket text primary key,
  attempts int not null,
  expires_at timestamptz not null
);
create table if not exists impeto.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('Esporte','Profissional','Desenvolvimento pessoal','Bem-estar','Comunidade')),
  modality text not null,
  description text not null,
  city text not null,
  venue text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  price_cents integer not null check (price_cents = 0 or price_cents between 100 and 1000000),
  capacity integer not null check (capacity between 1 and 100000),
  image text not null check (image in ('corrida','volei','workshop','bem-estar','largada','revezamento')),
  featured boolean not null default false,
  published boolean not null default false
);
create index if not exists impeto_public_agenda on impeto.events(starts_at, id) where published;
create table if not exists impeto.registrations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references impeto.members(id),
  event_id uuid not null references impeto.events(id),
  status text not null check (status in ('pending','confirmed','expired')),
  amount integer not null check (amount >= 0),
  code uuid not null unique default gen_random_uuid(),
  payment_mode text not null check (payment_mode in ('free','test','stripe')),
  stripe_session text unique,
  created_at timestamptz not null default now(),
  checked_in_at timestamptz
);
create unique index if not exists impeto_active_registration on impeto.registrations(member_id,event_id) where status <> 'expired';
create index if not exists impeto_event_capacity on impeto.registrations(event_id,status);
create table if not exists impeto.favorites (
  member_id uuid not null references impeto.members(id),
  event_id uuid not null references impeto.events(id),
  primary key(member_id,event_id)
);
create table if not exists impeto.notifications (
  registration_id uuid primary key references impeto.registrations(id),
  member_id uuid not null references impeto.members(id),
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists impeto_notifications_member on impeto.notifications(member_id, created_at desc);
create table if not exists impeto.daily_metrics (
  day date not null default current_date,
  metric text not null,
  count int not null default 0,
  total double precision not null default 0,
  primary key(day,metric)
);
revoke all on schema impeto from public;
revoke all on all tables in schema impeto from public;
alter table impeto.members enable row level security;
alter table impeto.sessions enable row level security;
alter table impeto.auth_limits enable row level security;
alter table impeto.events enable row level security;
alter table impeto.registrations enable row level security;
alter table impeto.favorites enable row level security;
alter table impeto.notifications enable row level security;
alter table impeto.daily_metrics enable row level security;
