create table households (
    id uuid primary key default gen_random_uuid(),
    name text,
    location_name text,
    latitude double precision,
    longitude double precision,
    widget_layout text[] not null default '{weather,homeCare,calendar}',
    color_theme text not null default 'sage',
    created_at timestamptz not null default now()
);

create table household_members (
    user_id uuid primary key references auth.users (id) on delete cascade,
    household_id uuid not null references households (id) on delete cascade
);

create function my_household_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
    select household_id from public.household_members where user_id = auth.uid()
$$;

alter table households enable row level security;
alter table household_members enable row level security;

create policy "Members can read their household"
    on households for select to authenticated
    using (id = my_household_id());

create policy "Members can update their household"
    on households for update to authenticated
    using (id = my_household_id())
    with check (id = my_household_id());

create policy "Users can read their own membership"
    on household_members for select to authenticated
    using (user_id = auth.uid());

grant select, update on public.households to authenticated;
grant select on public.household_members to authenticated;
grant execute on function public.my_household_id() to authenticated;