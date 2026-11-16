-- Bibléva: public Bible catalogue and private Plus data. Apply to a fresh Supabase project.
create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists vector with schema extensions;
create schema if not exists private;

create table public.bible_translations (
 id bigint generated always as identity primary key, code text not null unique, name text not null,
 language_code text not null, publication_year integer, publisher text, license text not null,
 source_url text not null, attribution text not null, status text not null default 'draft' check(status in ('draft','published','archived'))
);
create table public.bible_translation_versions (
 id bigint generated always as identity primary key, translation_id bigint not null references public.bible_translations(id),
 version_code text not null, source_sha256 text not null, imported_at timestamptz not null default now(),
 metadata jsonb not null default '{}', unique(translation_id,version_code)
);
create table public.bible_books (
 id bigint generated always as identity primary key, code text not null unique, slug text not null unique,
 name text not null, testament text not null check(testament in ('old','new')), canonical_order integer not null unique
);
create table public.bible_chapters (
 id bigint generated always as identity primary key, translation_version_id bigint not null references public.bible_translation_versions(id),
 book_id bigint not null references public.bible_books(id), number integer not null check(number>0), unique(translation_version_id,book_id,number)
);
create table public.bible_verses (
 id bigint generated always as identity primary key, chapter_id bigint not null references public.bible_chapters(id) on delete cascade,
 number integer not null check(number>0), reference text not null, text_exact text not null,
 text_normalized text not null, content_sha256 text not null, canonical_path text not null,
 metadata jsonb not null default '{}', search_vector tsvector generated always as (to_tsvector('french',text_exact)) stored,
 unique(chapter_id,number), unique(canonical_path)
);
create index bible_verses_fts on public.bible_verses using gin(search_vector);
create index bible_verses_trgm on public.bible_verses using gin(text_normalized gin_trgm_ops);
create table public.bible_passages (
 id bigint generated always as identity primary key, slug text not null unique, title text not null,
 summary text, editorial_status text not null default 'draft' check(editorial_status in ('draft','pending_review','approved','published','archived')),
 provenance text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.bible_passage_verses (
 passage_id bigint not null references public.bible_passages(id) on delete cascade,
 verse_id bigint not null references public.bible_verses(id) on delete cascade,
 position integer not null, primary key(passage_id,verse_id)
);
create table public.bible_themes (
 id bigint generated always as identity primary key, slug text not null unique, name text not null,
 description text, editorial_status text not null default 'draft' check(editorial_status in ('draft','pending_review','approved','published','archived'))
);
create table public.bible_entities (
 id bigint generated always as identity primary key, slug text not null unique, name text not null,
 entity_type text not null, description text, editorial_status text not null default 'draft' check(editorial_status in ('draft','pending_review','approved','published','archived'))
);
create table public.bible_verse_themes (
 verse_id bigint not null references public.bible_verses(id) on delete cascade, theme_id bigint not null references public.bible_themes(id) on delete cascade,
 provenance text not null, confidence numeric(3,2) check(confidence between 0 and 1), validation_status text not null default 'pending',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(verse_id,theme_id)
);
create table public.bible_verse_entities (
 verse_id bigint not null references public.bible_verses(id) on delete cascade, entity_id bigint not null references public.bible_entities(id) on delete cascade,
 provenance text not null, confidence numeric(3,2) check(confidence between 0 and 1), validation_status text not null default 'pending',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(verse_id,entity_id)
);
create table public.bible_cross_references (
 id bigint generated always as identity primary key, source_verse_id bigint not null references public.bible_verses(id), target_verse_id bigint not null references public.bible_verses(id),
 relation_type text not null, provenance text not null, confidence numeric(3,2) check(confidence between 0 and 1), validation_status text not null default 'pending',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(source_verse_id,target_verse_id,relation_type)
);
create table public.bible_parallel_passages (
 id bigint generated always as identity primary key, source_passage_id bigint not null references public.bible_passages(id), target_passage_id bigint not null references public.bible_passages(id),
 provenance text not null, confidence numeric(3,2) check(confidence between 0 and 1), validation_status text not null default 'pending',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(source_passage_id,target_passage_id)
);
create table public.feature_flags (key text primary key, enabled boolean not null default false, updated_at timestamptz not null default now());
insert into public.feature_flags(key) values ('semantic_search'),('ai_companion'),('advertising'),('subscriptions'),('donations'),('store'),('referrals'),('cash_commissions'),('gamification'),('notifications'),('extra_translations'),('audio'),('sync'),('watcher'),('experimental');

create table private.subscriptions (
 user_id uuid primary key references auth.users(id) on delete cascade, stripe_customer_id text unique,
 stripe_subscription_id text unique, status text not null default 'inactive', current_period_end timestamptz,
 updated_at timestamptz not null default now()
);
create or replace function private.has_plus() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from private.subscriptions s where s.user_id=(select auth.uid()) and s.status in ('active','trialing') and (s.current_period_end is null or s.current_period_end>now()))
$$;
revoke all on function private.has_plus() from public;
grant usage on schema private to authenticated;
grant execute on function private.has_plus() to authenticated;

create table public.user_notes (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 verse_id bigint not null references public.bible_verses(id), body text not null check(length(body)<=20000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_highlights (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 verse_id bigint not null references public.bible_verses(id), color text not null check(color in ('gold','blue','green','rose')),
 created_at timestamptz not null default now(), unique(user_id,verse_id)
);
create table public.user_favorites (
 user_id uuid not null references auth.users(id) on delete cascade, verse_id bigint not null references public.bible_verses(id),
 created_at timestamptz not null default now(), primary key(user_id,verse_id)
);
create table public.reading_progress (
 user_id uuid primary key references auth.users(id) on delete cascade, verse_id bigint not null references public.bible_verses(id),
 updated_at timestamptz not null default now()
);

-- Public content is readable only when its translation or editorial record is published.
alter table public.bible_translations enable row level security;
alter table public.bible_translation_versions enable row level security;
alter table public.bible_books enable row level security;
alter table public.bible_chapters enable row level security;
alter table public.bible_verses enable row level security;
alter table public.bible_passages enable row level security;
alter table public.bible_passage_verses enable row level security;
alter table public.bible_themes enable row level security;
alter table public.bible_entities enable row level security;
alter table public.bible_verse_themes enable row level security;
alter table public.bible_verse_entities enable row level security;
alter table public.bible_cross_references enable row level security;
alter table public.bible_parallel_passages enable row level security;
alter table public.feature_flags enable row level security;
alter table public.user_notes enable row level security;
alter table public.user_highlights enable row level security;
alter table public.user_favorites enable row level security;
alter table public.reading_progress enable row level security;
alter table private.subscriptions enable row level security;

create policy translations_read on public.bible_translations for select to anon,authenticated using(status='published');
create policy versions_read on public.bible_translation_versions for select to anon,authenticated using(exists(select 1 from public.bible_translations t where t.id=translation_id and t.status='published'));
create policy books_read on public.bible_books for select to anon,authenticated using(true);
create policy chapters_read on public.bible_chapters for select to anon,authenticated using(exists(select 1 from public.bible_translation_versions v join public.bible_translations t on t.id=v.translation_id where v.id=translation_version_id and t.status='published'));
create policy verses_read on public.bible_verses for select to anon,authenticated using(exists(select 1 from public.bible_chapters c join public.bible_translation_versions v on v.id=c.translation_version_id join public.bible_translations t on t.id=v.translation_id where c.id=chapter_id and t.status='published'));
create policy passages_read on public.bible_passages for select to anon,authenticated using(editorial_status='published');
create policy passage_verses_read on public.bible_passage_verses for select to anon,authenticated using(exists(select 1 from public.bible_passages p where p.id=passage_id and p.editorial_status='published'));
create policy themes_read on public.bible_themes for select to anon,authenticated using(editorial_status='published');
create policy entities_read on public.bible_entities for select to anon,authenticated using(editorial_status='published');
create policy verse_themes_read on public.bible_verse_themes for select to anon,authenticated using(validation_status='approved' and exists(select 1 from public.bible_themes t where t.id=theme_id and t.editorial_status='published'));
create policy verse_entities_read on public.bible_verse_entities for select to anon,authenticated using(validation_status='approved' and exists(select 1 from public.bible_entities e where e.id=entity_id and e.editorial_status='published'));
create policy cross_references_read on public.bible_cross_references for select to anon,authenticated using(validation_status='approved');
create policy parallel_passages_read on public.bible_parallel_passages for select to anon,authenticated using(validation_status='approved');
create policy flags_read on public.feature_flags for select to anon,authenticated using(true);

create policy notes_owner on public.user_notes for all to authenticated using(user_id=(select auth.uid()) and private.has_plus()) with check(user_id=(select auth.uid()) and private.has_plus());
create policy highlights_owner on public.user_highlights for all to authenticated using(user_id=(select auth.uid()) and private.has_plus()) with check(user_id=(select auth.uid()) and private.has_plus());
create policy favorites_owner on public.user_favorites for all to authenticated using(user_id=(select auth.uid()) and private.has_plus()) with check(user_id=(select auth.uid()) and private.has_plus());
create policy progress_owner on public.reading_progress for all to authenticated using(user_id=(select auth.uid()) and private.has_plus()) with check(user_id=(select auth.uid()) and private.has_plus());
create policy subscription_owner_read on private.subscriptions for select to authenticated using(user_id=(select auth.uid()));

-- No client receives write grants for catalogue, flags or subscription state.
grant select on public.bible_translations,public.bible_translation_versions,public.bible_books,public.bible_chapters,public.bible_verses,public.bible_passages,public.bible_passage_verses,public.bible_themes,public.bible_entities,public.bible_verse_themes,public.bible_verse_entities,public.bible_cross_references,public.bible_parallel_passages,public.feature_flags to anon,authenticated;
grant select,insert,update,delete on public.user_notes,public.user_highlights,public.user_favorites,public.reading_progress to authenticated;
grant select on private.subscriptions to authenticated;
