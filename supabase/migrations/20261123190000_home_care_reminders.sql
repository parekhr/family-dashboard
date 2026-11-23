-- Home Care reminders: each item gets an optional "change every N months" interval
-- and a snooze date. The dashboard works out the due date (last change + interval)
-- and shows a reminder from a week before it's due, unless snoozed.

alter table home_care_items
    add column interval_months int check (interval_months > 0),   -- null = no reminder
    add column snoozed_until date;                                 -- hide the reminder until this day

-- Members can set those two columns from the app, and nothing else on the item
grant update (interval_months, snoozed_until) on public.home_care_items to authenticated;

create policy "Members can update their home care items"
    on home_care_items for update to authenticated
    using (household_id = my_household_id())
    with check (household_id = my_household_id());

-- Home Care now lives behind the header's reminders bell, so new households
-- start without the widget (it can still be added back to widget_layout)
alter table households alter column widget_layout set default '{weather,calendar}';
