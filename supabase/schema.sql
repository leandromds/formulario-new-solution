-- Executar uma vez no SQL Editor de um projeto Supabase.
begin;

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null constraint interviews_client_id_key unique,
  company_name text not null,
  segment text not null,
  frequency_score smallint not null check (frequency_score between 1 and 5),
  urgency_score smallint not null check (urgency_score between 1 and 5),
  payment_score smallint not null check (payment_score between 1 and 5),
  answers jsonb not null,
  schema_version smallint not null default 1,
  created_at timestamptz not null default now()
);

alter table public.interviews enable row level security;

-- Retirar privilégios padrão e conceder somente INSERT ao cliente anônimo.
revoke all on table public.interviews from public, anon, authenticated;
grant usage on schema public to anon;
grant insert on table public.interviews to anon;

create policy "anonymous interview insert"
on public.interviews
for insert
to anon
with check (true);

commit;
