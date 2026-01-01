/*
  # Configuração Inicial do Barbershop e Admin

  ## Descrição da Query:
  1. Cria tabelas essenciais: profiles, services, barbers, appointments.
  2. Configura a automação para definir 'admin@barber.com' como administrador automaticamente.
  3. Insere dados iniciais (Seed) para serviços e barbeiros.
  4. Define políticas de segurança (RLS) para proteger os dados.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Security Implications:
  - RLS Habilitado em todas as tabelas.
  - Apenas o próprio usuário pode ver/editar seu perfil e agendamentos.
  - Admins terão permissão especial para ver todos os agendamentos (configurado na política).
*/

-- 1. Tabela de Perfis (Vinculada ao Auth do Supabase)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  role text default 'client' check (role in ('client', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Perfis visíveis para todos (necessário para login)" on public.profiles
  for select using (true);

create policy "Usuários podem inserir seu próprio perfil" on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "Usuários podem atualizar seu próprio perfil" on public.profiles
  for update using ((select auth.uid()) = id);

-- 2. Trigger para definir Admin automaticamente e criar Perfil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    -- Lógica Mágica: Se o email for o do admin, define role como 'admin'
    case when new.email = 'admin@barber.com' then 'admin' else 'client' end
  );
  return new;
end;
$$;

-- Recria o trigger para garantir que está atualizado
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Tabela de Serviços
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price text not null,
  duration text not null,
  icon text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.services enable row level security;
create policy "Serviços visíveis para todos" on public.services for select using (true);

-- 4. Tabela de Barbeiros
create table if not exists public.barbers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  image text not null,
  rating numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.barbers enable row level security;
create policy "Barbeiros visíveis para todos" on public.barbers for select using (true);

-- 5. Tabela de Agendamentos
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  service_id uuid references public.services(id) not null,
  barber_id uuid references public.barbers(id),
  date text not null, -- Formato YYYY-MM-DD
  time text not null, -- Formato HH:MM
  status text default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.appointments enable row level security;

-- Política: Usuário vê apenas seus agendamentos
create policy "Usuários veem seus próprios agendamentos" on public.appointments
  for select using (auth.uid() = user_id);

-- Política: Usuário cria agendamento para si mesmo
create policy "Usuários criam seus agendamentos" on public.appointments
  for insert with check (auth.uid() = user_id);

-- Política: Admin vê TODOS os agendamentos
create policy "Admins veem todos os agendamentos" on public.appointments
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 6. Inserir Dados Iniciais (Seed) se as tabelas estiverem vazias
insert into public.services (name, price, duration, icon)
select 'Corte de Cabelo', 'R$ 50,00', '45 min', 'scissors'
where not exists (select 1 from public.services);

insert into public.services (name, price, duration, icon)
select 'Barba Completa', 'R$ 35,00', '30 min', 'smile'
where not exists (select 1 from public.services where name = 'Barba Completa');

insert into public.services (name, price, duration, icon)
select 'Combo (Cabelo + Barba)', 'R$ 75,00', '1h 15m', 'star'
where not exists (select 1 from public.services where name = 'Combo (Cabelo + Barba)');

insert into public.barbers (name, rating, image)
select 'Carlos Silva', 4.9, 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&auto=format&fit=crop&q=60'
where not exists (select 1 from public.barbers);

insert into public.barbers (name, rating, image)
select 'João Souza', 4.8, 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&auto=format&fit=crop&q=60'
where not exists (select 1 from public.barbers where name = 'João Souza');

insert into public.barbers (name, rating, image)
select 'Pedro Santos', 5.0, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60'
where not exists (select 1 from public.barbers where name = 'Pedro Santos');
