-- New household setup. Run once per household in the SQL Editor.
-- Before running:
--   1. Create the user in Authentication → Users (auto-confirm), using <EMAIL>.
--   2. Replace every <PLACEHOLDER> below. Search for "<" to find them all.

begin;

-- 1. Household
insert into households (name)
values ('<HOUSEHOLD NAME>');

-- 2. Membership: links the login to the household
insert into household_members (user_id, household_id)
select u.id, h.id
from auth.users u
cross join households h
where u.email = '<EMAIL>' and h.name = '<HOUSEHOLD NAME>';

-- 3. Categories
insert into categories (household_id, name, color)
select h.id, v.name, v.color
from households h
cross join (values
    ('<CATEGORY NAME>', null),
    ('<CATEGORY NAME>', null)
) as v (name, color)
where h.name = '<HOUSEHOLD NAME>';

-- 4. People
insert into people (household_id, name)
select h.id, v.name
from households h
cross join (values
    ('<PERSON NAME>'),
    ('<PERSON NAME>')
) as v (name)
where h.name = '<HOUSEHOLD NAME>';

-- 5. Home Care items (icon must be one of: 'air-vent', 'droplet' (the icons map in HomeCareWidget.tsx))
insert into home_care_items (household_id, name, sort_order, icon, model, size)
select h.id, v.name, v.sort_order, v.icon, v.model, v.size
from households h
cross join (values
    ('<HOME CARE ITEM NAME>', 1, '<ICON>', null, null),  -- model, size: text or null
    ('<HOME CARE ITEM NAME>', 2, '<ICON>', null, null)
) as v (name, sort_order, icon, model, size)
where h.name = '<HOUSEHOLD NAME>';

commit;

-- After running: should show 1 row with the email and household name.
-- No rows means the email didn't match a user. Fix it and add the membership again.
select u.email, h.name
from household_members m
join auth.users u on u.id = m.user_id
join households h on h.id = m.household_id
where h.name = '<HOUSEHOLD NAME>';