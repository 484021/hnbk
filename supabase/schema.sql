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
create policy "Public read case_studies"
  on public.case_studies
  for select
  to anon, authenticated
  using (true);

-- Service role full access
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

alter table public.blog_posts enable row level security;

-- Public can only read published posts
create policy "Public read published blog_posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (published = true);

-- Service role full access
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
