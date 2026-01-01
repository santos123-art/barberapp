/*
  # Inicialização do Schema de Perfis e Autenticação

  ## Query Description:
  Cria a tabela de perfis (profiles) vinculada à tabela de usuários do Supabase Auth.
  Configura um trigger para criar automaticamente o perfil quando um usuário se cadastra.
  Define lógica especial para tornar 'admin@barber.com' um administrador automaticamente.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Tabela: public.profiles
  - Trigger: on_auth_user_created
  - Função: public.handle_new_user
*/

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  role text default 'client' check (role in ('client', 'admin')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Create a trigger to automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    case 
      when new.email = 'admin@barber.com' then 'admin'
      else coalesce(new.raw_user_meta_data->>'role', 'client')
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid conflicts on re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
