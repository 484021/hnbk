-- ============================================
-- HNBK Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Leads ────────────────────────────────────────────────────
create table if not exists public.leads (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  email             text not null,
  company           text,
  phone             text,
  message           text not null,
  service_interest  text,
  created_at        timestamptz not null default now()
);

-- RLS: only service role can read/insert
alter table public.leads enable row level security;

drop policy if exists "Service role full access on leads" on public.leads;
create policy "Service role full access on leads"
  on public.leads
  for all
  to service_role
  using (true)
  with check (true);

-- ─── Case Studies ─────────────────────────────────────────────
create table if not exists public.case_studies (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  title         text not null,
  client        text not null,
  industry      text not null,
  challenge     text not null,
  solution      text not null,
  results       jsonb not null default '{}',
  tags          text[] not null default '{}',
  hero_image    text,
  published_at  timestamptz not null default now()
);

alter table public.case_studies enable row level security;

-- Public read (published case studies visible to all)
drop policy if exists "Public read case_studies" on public.case_studies;
create policy "Public read case_studies"
  on public.case_studies
  for select
  to anon, authenticated
  using (true);

-- Service role full access
drop policy if exists "Service role full access on case_studies" on public.case_studies;
create policy "Service role full access on case_studies"
  on public.case_studies
  for all
  to service_role
  using (true)
  with check (true);

-- ─── Blog Posts ───────────────────────────────────────────────
create table if not exists public.blog_posts (
  id               uuid primary key default uuid_generate_v4(),
  slug             text unique not null,
  title            text not null,
  excerpt          text not null,           -- 1–2 sentence summary shown on listing page
  content          text not null,           -- full post body as HTML
  meta_description text,                    -- 150–160 chars for SEO (falls back to excerpt)
  og_image_url     text,                    -- null = use site default OG image
  tags             text[] not null default '{}',
  author           text not null default 'HNBK Team',
  published        boolean not null default false,
  ai_generated     boolean not null default false,
  published_at     timestamptz,             -- set when published = true
  updated_at       timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

-- Migration: add columns if upgrading from earlier schema
alter table public.blog_posts add column if not exists meta_description text;
alter table public.blog_posts add column if not exists og_image_url text;
alter table public.blog_posts add column if not exists published_at timestamptz;
alter table public.blog_posts add column if not exists updated_at timestamptz not null default now();
alter table public.blog_posts add column if not exists ai_generated boolean not null default false;

alter table public.blog_posts enable row level security;

-- Public can only read published posts
drop policy if exists "Public read published blog_posts" on public.blog_posts;
create policy "Public read published blog_posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (published = true);

-- Service role full access
drop policy if exists "Service role full access on blog_posts" on public.blog_posts;
create policy "Service role full access on blog_posts"
  on public.blog_posts
  for all
  to service_role
  using (true)
  with check (true);

-- ─── Indexes ──────────────────────────────────────────────────
create index if not exists leads_created_at_idx         on public.leads (created_at desc);
create index if not exists case_studies_slug_idx        on public.case_studies (slug);
create index if not exists blog_posts_slug_idx          on public.blog_posts (slug);
create index if not exists blog_posts_published_idx     on public.blog_posts (published, created_at desc);
create index if not exists blog_posts_published_at_idx  on public.blog_posts (published_at desc);

-- ─── Blog Generations ─────────────────────────────────────────
-- Stores each pipeline run: topic, research, raw write output, and final post link.
-- Allows retry-from-research if the write step fails, and provides a full audit trail.
create table if not exists public.blog_generations (
  id                uuid primary key default uuid_generate_v4(),
  created_at        timestamptz not null default now(),
  topic             text not null,
  research_broad    text,                          -- raw research from researchBroad()
  research_local    text,                          -- raw research from researchLocal()
  raw_write_output  text,                          -- raw Gemini JSON string before parsing
  post_id           uuid references public.blog_posts(id) on delete set null,
  status            text not null default 'in_progress', -- in_progress | complete | failed
  error_details     text
);

alter table public.blog_generations enable row level security;

-- Service role only — never exposed to anon/authenticated users
drop policy if exists "Service role full access on blog_generations" on public.blog_generations;
create policy "Service role full access on blog_generations"
  on public.blog_generations
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists blog_generations_created_at_idx on public.blog_generations (created_at desc);
create index if not exists blog_generations_status_idx     on public.blog_generations (status);
