-- LOKALGO SHOP - pickup instruction migration
-- The current app stores shop records in sellers. This also supports a future
-- shops table if the database is renamed to match the product language.

do $$
begin
  if to_regclass('public.shops') is not null then
    alter table public.shops add column if not exists pickup_instruction text;
  end if;

  if to_regclass('public.sellers') is not null then
    alter table public.sellers add column if not exists pickup_instruction text;
  end if;
end $$;
