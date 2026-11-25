-- The font the household name is drawn in, picked in Settings → Household. A key like
-- 'handwritten', not CSS: the app maps keys to fonts (src/lib/nameFonts.ts) and falls back
-- to 'classic' for unknown ones.
-- (Households can already update their own row, so no new grant or policy is needed.)
alter table households add column name_font text not null default 'classic';
