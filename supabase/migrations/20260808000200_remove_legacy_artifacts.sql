-- Remove the legacy artifacts table after confirming it is empty and unused.
-- Run manually only after reviewing the preflight checks below.

begin;

do $$
declare
  legacy_table regclass := to_regclass('public.artifacts');
  legacy_row_count bigint;
  dependent_foreign_keys bigint;
begin
  if legacy_table is null then
    raise notice 'public.artifacts does not exist; nothing to remove.';
    return;
  end if;

  execute 'select count(*) from public.artifacts' into legacy_row_count;

  if legacy_row_count > 0 then
    raise exception
      'Aborted: public.artifacts contains % row(s). Archive or review the data before removing the table.',
      legacy_row_count;
  end if;

  select count(*)
  into dependent_foreign_keys
  from pg_constraint
  where confrelid = legacy_table
    and contype = 'f';

  if dependent_foreign_keys > 0 then
    raise exception
      'Aborted: public.artifacts has % dependent foreign key(s). Review dependencies before removing the table.',
      dependent_foreign_keys;
  end if;

  execute 'drop table public.artifacts';
  raise notice 'Removed empty legacy table public.artifacts.';
end;
$$;

commit;
