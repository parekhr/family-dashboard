-- Let households add, edit and delete their own Home Care items from the app
-- (until now only the reminder interval and snooze could be changed).

-- Fill household_id in automatically for items the app adds
alter table home_care_items alter column household_id set default my_household_id();

-- Every column the app edits, now that the name, icon, model, size and order can change too.
-- (The update policy came with the reminders migration.)
grant insert, delete on public.home_care_items to authenticated;
grant update (name, icon, model, size, sort_order, interval_months, snoozed_until)
    on public.home_care_items to authenticated;

create policy "Members can add their home care items"
    on home_care_items for insert to authenticated
    with check (household_id = my_household_id());

-- Deleting an item deletes its history too (home_care_logs cascades)
create policy "Members can delete their home care items"
    on home_care_items for delete to authenticated
    using (household_id = my_household_id());
