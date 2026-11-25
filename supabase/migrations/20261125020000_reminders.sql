-- Home Care becomes Reminders (November 25, 2026): "after this amount of time, remind me to
-- do this", set up and used from the header bell. The tables keep their home_care names for
-- now (renaming them would break tablets still on the old version; see the release routine).

-- Notes: anything else worth knowing about an item (part number, which store, where it's kept)
alter table home_care_items add column notes text check (char_length(notes) <= 300);

-- How often, as a count and a unit, so reminders can be daily or weekly as well as monthly:
-- (1, 'day') = every day, (2, 'week') = every 2 weeks, (6, 'month') = every 6 months.
-- Both set or both empty.
alter table home_care_items
    add column interval_count int check (interval_count > 0),
    add column interval_unit text check (interval_unit in ('day', 'week', 'month')),
    add constraint interval_count_and_unit check ((interval_count is null) = (interval_unit is null));

-- Existing monthly reminders carry over as-is
update home_care_items
set interval_count = interval_months, interval_unit = 'month'
where interval_months is not null;

-- interval_months stays for now so tablets on the old version keep working; the app still
-- fills it in for monthly reminders. Drop it in a later release, once every tablet has reloaded.

-- The app edits the new columns too (insert and delete were granted with the items migration)
grant update (notes, interval_count, interval_unit) on public.home_care_items to authenticated;
