-- Execute no SQL Editor do Supabase uma única vez.
create extension if not exists pgcrypto;
create table if not exists public.feedbacks (id uuid primary key default gen_random_uuid(),display_name text not null check (char_length(btrim(display_name)) between 2 and 40),message text not null check (char_length(btrim(message)) between 10 and 600),rating smallint not null check (rating between 1 and 5),is_published boolean not null default true,created_at timestamptz not null default now());
alter table public.feedbacks enable row level security;
alter table public.feedbacks force row level security;
revoke all on table public.feedbacks from anon, authenticated;
grant select on table public.feedbacks to anon, authenticated;
drop policy if exists "public can read published feedbacks" on public.feedbacks;
create policy "public can read published feedbacks" on public.feedbacks for select to anon, authenticated using (is_published=true);
create index if not exists feedbacks_published_created_at_idx on public.feedbacks (created_at desc) where is_published=true;
create table if not exists public.feedback_submission_limits (bucket_key text primary key,request_count integer not null default 1 check (request_count between 1 and 10),window_started_at timestamptz not null default now());
alter table public.feedback_submission_limits enable row level security;
revoke all on table public.feedback_submission_limits from anon, authenticated;
grant select, insert, update on table public.feedback_submission_limits to service_role;
select has_table_privilege('anon','public.feedbacks','select') as anon_can_read,has_table_privilege('anon','public.feedbacks','insert, update, delete') as anon_can_write,has_table_privilege('authenticated','public.feedbacks','insert, update, delete') as authenticated_can_write;


