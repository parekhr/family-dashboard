-- Reminders keep their extra details in Notes only (November 25, 2026): model and size are
-- folded into the start of notes, one "Model: ..." / "Size: ..." line each, ahead of
-- anything already written there. The model and size columns stay for now so tablets on the
-- old version keep working; drop them in a later release, once every tablet has reloaded.

update home_care_items
set notes = left(
    concat_ws(
        e'\n',
        case when model is not null and model <> '' then 'Model: ' || model end,
        case when size is not null and size <> '' then 'Size: ' || size end,
        nullif(notes, '')
    ),
    300   -- the notes limit; model and size are 40 each, so this only trims very long notes
)
where (model is not null and model <> '') or (size is not null and size <> '');
