-- Remember where a widget sits even while it's turned off, so turning one off and on
-- in Settings never moves its row.
--   widget_layout:  every widget, in the order the household arranged them (on or off)
--   hidden_widgets: the ones that are off
-- Until now widget_layout held only the widgets that were on, so an off widget had no place.

alter table households add column hidden_widgets text[] not null default '{}';

-- Existing households: widgets missing from their list go to the end, marked off.
-- (Both right-hand sides read the row as it was before this update.)
update households set
    hidden_widgets = array(
        select w from unnest(array['weather', 'calendar', 'homeCare']) as w
        where not (w = any (widget_layout))
    ),
    widget_layout = widget_layout || array(
        select w from unnest(array['weather', 'calendar', 'homeCare']) as w
        where not (w = any (widget_layout))
    );

-- New households: every widget listed, Home Care off (it lives behind the reminders bell)
alter table households alter column widget_layout set default '{weather,calendar,homeCare}';
alter table households alter column hidden_widgets set default '{homeCare}';
