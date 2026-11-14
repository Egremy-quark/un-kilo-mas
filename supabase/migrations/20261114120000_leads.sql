-- Tabla de correos para la Rutina 01 y, más adelante, la app.
-- RLS activado. Sin políticas de lectura ni escritura para anon/authenticated.
-- El endpoint del servidor inserta con la clave de servicio, que salta RLS.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  correo text not null,
  origen text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  aviso_aceptado boolean not null default false,
  creado_en timestamptz not null default now()
);

create index if not exists leads_correo_idx on public.leads (correo);
create index if not exists leads_creado_en_idx on public.leads (creado_en desc);

alter table public.leads enable row level security;

revoke all on public.leads from anon, authenticated;
grant insert, select, update, delete on public.leads to service_role;
