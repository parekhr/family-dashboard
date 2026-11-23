-- Let households manage their own calendar categories and people from Settings
-- (until now the app could only read them; they were added by hand in the SQL Editor).

-- Fill household_id in automatically for rows the app adds, like events already do
alter table categories alter column household_id set default my_household_id();
alter table people alter column household_id set default my_household_id();

grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.people to authenticated;

create policy "Members can add their categories"
    on categories for insert to authenticated
    with check (household_id = my_household_id());

create policy "Members can update their categories"
    on categories for update to authenticated
    using (household_id = my_household_id())
    with check (household_id = my_household_id());

-- Events still block deleting a category they use (on delete restrict);
-- the app moves them to another category first.
create policy "Members can delete their categories"
    on categories for delete to authenticated
    using (household_id = my_household_id());

create policy "Members can add their people"
    on people for insert to authenticated
    with check (household_id = my_household_id());

create policy "Members can update their people"
    on people for update to authenticated
    using (household_id = my_household_id())
    with check (household_id = my_household_id());

-- Deleting a person removes them from their events (event_people cascades)
create policy "Members can delete their people"
    on people for delete to authenticated
    using (household_id = my_household_id());
