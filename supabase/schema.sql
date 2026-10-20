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

create table categories (
    id uuid primary key default gen_random_uuid(),
    household_id uuid not null references households (id) on delete cascade,
    name text not null,
    color text,
    created_at timestamptz not null default now(),
    unique (id, household_id)
);

create table people (
    id uuid primary key default gen_random_uuid(),
    household_id uuid not null references households (id) on delete cascade,
    name text not null,
    created_at timestamptz not null default now(),
    unique (id, household_id)
);

create table events (
    id uuid primary key default gen_random_uuid(),
    household_id uuid not null default my_household_id(),
    category_id uuid not null,
    title text check (char_length(title) <= 60),
    start_date date not null,
    end_date date not null,
    all_day boolean not null,
    time time,
    created_at timestamptz not null default now(),
    check (end_date >= start_date),
    foreign key (category_id, household_id)
        references categories (id, household_id) on delete restrict,
    unique (id, household_id),
    check ((all_day and time is null) or (not all_day and time is not null))
);

create table event_people (
    household_id uuid not null default my_household_id(),
    event_id uuid not null,
    person_id uuid not null,
    created_at timestamptz not null default now(),
    foreign key (event_id, household_id)
        references events (id, household_id) on delete cascade,
    foreign key (person_id, household_id)
        references people (id, household_id) on delete cascade,
    primary key (event_id, person_id)
);

alter table households enable row level security;
alter table household_members enable row level security;
alter table home_care_items enable row level security;
alter table home_care_logs enable row level security;
alter table categories enable row level security;
alter table people enable row level security;
alter table events enable row level security;
alter table event_people enable row level security;

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

create policy "Members can read their categories"
    on categories for select to authenticated
    using (household_id = my_household_id());

create policy "Members can read their people"
    on people for select to authenticated
    using (household_id = my_household_id());

create policy "Members can read their events"
    on events for select to authenticated
    using (household_id = my_household_id());

create policy "Members can add their events"
    on events for insert to authenticated
    with check (household_id = my_household_id());

create policy "Members can update their events"
    on events for update to authenticated
    using (household_id = my_household_id())
    with check (household_id = my_household_id());

create policy "Members can delete their events"
    on events for delete to authenticated
    using (household_id = my_household_id());

create policy "Members can read their event_people"
    on event_people for select to authenticated
    using (household_id = my_household_id());

create policy "Members can add their event_people"
    on event_people for insert to authenticated
    with check (household_id = my_household_id());
    
create policy "Members can delete their event_people"
    on event_people for delete to authenticated
    using (household_id = my_household_id());

grant select, update on public.households to authenticated;
grant select on public.household_members to authenticated;
grant execute on function public.my_household_id() to authenticated;
grant select on public.home_care_items to authenticated;
grant select, insert, update, delete on public.home_care_logs to authenticated;
grant select on public.categories to authenticated;
grant select on public.people to authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, delete on public.event_people to authenticated;

insert into categories (household_id, name, color)
select h.id, 'Appointment', '#335F57'
from households h
where h.name = 'Parekh Household';

insert into categories (household_id, name, color)
select h.id, v.name, v.color
from households h
cross join (values
    ('Appointment', null),
    ('Vacation', null)
) as v (name, color)
where h.name = 'Parekh Household';

