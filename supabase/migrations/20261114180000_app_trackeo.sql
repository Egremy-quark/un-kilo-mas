-- App de trackeo. Cada usuario solo ve y escribe lo suyo.
-- Los bloques son contenido general, el mismo para todos.
-- tipo_acceso no lo cambia el usuario: lo cambia un socio o, más adelante, el pago.

create table if not exists public.configuracion (
  clave text primary key,
  valor text not null
);

insert into public.configuracion (clave, valor) values
  ('app_abierta_al_publico', 'false'),
  -- paquete = acceso de prueba. Cambiar a ninguno antes de abrir al público.
  ('acceso_inicial', 'paquete')
on conflict (clave) do nothing;

alter table public.configuracion enable row level security;
grant select on public.configuracion to authenticated, anon;

create policy configuracion_lectura
  on public.configuracion
  for select
  to anon, authenticated
  using (true);

create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  correo text,
  tipo_acceso text not null default 'ninguno'
    check (tipo_acceso in ('ninguno', 'gratuito', 'coaching', 'paquete')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists perfiles_tipo_acceso_idx on public.perfiles (tipo_acceso);

alter table public.perfiles enable row level security;
revoke all on public.perfiles from anon;
grant select on public.perfiles to authenticated;

create policy perfiles_select_propio
  on public.perfiles
  for select
  to authenticated
  using (id = auth.uid());

create or replace function public.acceso_inicial()
returns text
language sql
stable
as $$
  select coalesce(
    (select valor from public.configuracion where clave = 'acceso_inicial'),
    'ninguno'
  );
$$;

create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, correo, tipo_acceso)
  values (new.id, new.email, public.acceso_inicial())
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.manejar_nuevo_usuario();

create table if not exists public.bloques (
  id uuid primary key default gen_random_uuid(),
  clave text not null unique,
  nombre text not null,
  descripcion text not null,
  orden integer not null default 0,
  publicado boolean not null default false,
  es_prueba boolean not null default true,
  creado_en timestamptz not null default now()
);

create index if not exists bloques_publicado_orden_idx on public.bloques (publicado, orden);

create table if not exists public.sesiones_bloque (
  id uuid primary key default gen_random_uuid(),
  bloque_id uuid not null references public.bloques (id) on delete cascade,
  posicion integer not null,
  objetivo text not null,
  unique (bloque_id, posicion)
);

create index if not exists sesiones_bloque_bloque_idx on public.sesiones_bloque (bloque_id, posicion);

create table if not exists public.ejercicios_sesion (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid not null references public.sesiones_bloque (id) on delete cascade,
  ejercicio text not null,
  orden integer not null,
  series_previstas integer not null check (series_previstas > 0),
  repeticiones_previstas integer not null check (repeticiones_previstas > 0),
  nota_tecnica text not null default '[CONTENIDO POR YOHAN]',
  unique (sesion_id, orden)
);

create index if not exists ejercicios_sesion_sesion_idx on public.ejercicios_sesion (sesion_id, orden);

alter table public.bloques enable row level security;
alter table public.sesiones_bloque enable row level security;
alter table public.ejercicios_sesion enable row level security;

grant select on public.bloques, public.sesiones_bloque, public.ejercicios_sesion to authenticated, anon;

create policy bloques_publicados
  on public.bloques
  for select
  to anon, authenticated
  using (publicado = true);

create policy sesiones_de_bloque_publicado
  on public.sesiones_bloque
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.bloques b
      where b.id = bloque_id and b.publicado = true
    )
  );

create policy ejercicios_de_bloque_publicado
  on public.ejercicios_sesion
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.sesiones_bloque s
      join public.bloques b on b.id = s.bloque_id
      where s.id = sesion_id and b.publicado = true
    )
  );

create table if not exists public.entrenamientos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  bloque_id uuid references public.bloques (id) on delete set null,
  sesion_id uuid references public.sesiones_bloque (id) on delete set null,
  estado text not null default 'abierta' check (estado in ('abierta', 'cerrada')),
  iniciado_en timestamptz not null default now(),
  cerrado_en timestamptz
);

create index if not exists entrenamientos_usuario_fecha_idx
  on public.entrenamientos (usuario_id, iniciado_en desc);
create index if not exists entrenamientos_usuario_estado_idx
  on public.entrenamientos (usuario_id, estado);

create table if not exists public.series_registradas (
  id uuid primary key default gen_random_uuid(),
  entrenamiento_id uuid not null references public.entrenamientos (id) on delete cascade,
  ejercicio text not null,
  numero_serie integer not null check (numero_serie > 0),
  peso_kg numeric(8, 2) not null check (peso_kg >= 0),
  repeticiones integer not null check (repeticiones >= 0),
  completada boolean not null default true
);

create index if not exists series_entrenamiento_idx
  on public.series_registradas (entrenamiento_id, numero_serie);
create index if not exists series_ejercicio_idx
  on public.series_registradas (ejercicio);

create table if not exists public.progreso_bloque (
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  bloque_id uuid not null references public.bloques (id) on delete cascade,
  sesion_id uuid references public.sesiones_bloque (id) on delete set null,
  estado text not null default 'en_curso' check (estado in ('en_curso', 'terminado')),
  actualizado_en timestamptz not null default now(),
  primary key (usuario_id, bloque_id)
);

alter table public.entrenamientos enable row level security;
alter table public.series_registradas enable row level security;
alter table public.progreso_bloque enable row level security;

revoke all on public.entrenamientos, public.series_registradas, public.progreso_bloque from anon;
grant select, insert, update, delete on public.entrenamientos to authenticated;
grant select, insert, update, delete on public.series_registradas to authenticated;
grant select, insert, update, delete on public.progreso_bloque to authenticated;

create policy entrenamientos_propios
  on public.entrenamientos
  for all
  to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy series_de_entrenamiento_propio
  on public.series_registradas
  for all
  to authenticated
  using (
    exists (
      select 1 from public.entrenamientos e
      where e.id = entrenamiento_id and e.usuario_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.entrenamientos e
      where e.id = entrenamiento_id and e.usuario_id = auth.uid()
    )
  );

create policy progreso_propio
  on public.progreso_bloque
  for all
  to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());
