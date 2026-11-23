-- The Sports widget's favorite teams, per household. Each entry is the league and ESPN's
-- team id, e.g. 'nba:2' (Celtics) or 'nfl:17' (Patriots); ids stay the same even if a team's
-- name or abbreviation changes. Saved from Settings → Widgets → Sports → Favorite teams.
-- (Households can already update their own row, so no new grant or policy is needed.)
alter table households add column favorite_teams text[] not null default '{}';
