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

create table home_care_items (
    id uuid primary key default gen_random_uuid(),
    household_id uuid not null references households (id) on delete cascade,
    name text not null,
    icon text not null,
    model text,
    size text,
    sort_order int not null,
    created_at timestamptz not null default now(),
    unique (id, household_id)
);

create table home_care_logs (
    id uuid primary key default gen_random_uuid(),
    household_id uuid not null default my_household_id(),
    item_id uuid not null,
    logged_on date not null,
    created_at timestamptz not null default now(),
    foreign key (item_id, household_id)
        references home_care_items (id, household_id) on delete cascade,
    unique (item_id, logged_on)
);

alter table households enable row level security;
alter table household_members enable row level security;
alter table home_care_items enable row level security;
alter table home_care_logs enable row level security;

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

create policy "Members can read their home care items"
    on home_care_items for select to authenticated
    using (household_id = my_household_id());

create policy "Members can read their home care logs"
    on home_care_logs for select to authenticated
    using (household_id = my_household_id());

create policy "Members can add their home care logs"
    on home_care_logs for insert to authenticated
    with check (household_id = my_household_id());

create policy "Members can update their home care logs"
    on home_care_logs for update to authenticated
    using (household_id = my_household_id())
    with check (household_id = my_household_id());

create policy "Members can delete their home care logs"
    on home_care_logs for delete to authenticated
    using (household_id = my_household_id());

grant select, update on public.households to authenticated;
grant select on public.household_members to authenticated;
grant execute on function public.my_household_id() to authenticated;
grant select on public.home_care_items to authenticated;
grant select, insert, update, delete on public.home_care_logs to authenticated;
