-- Close the INSERT-side gap in protect_seller_plan_fields().
-- The previous version only guarded UPDATE — a direct client-side INSERT
-- (sellers_own_write RLS policy allows auth.uid() = user_id on INSERT too)
-- could still self-set plan_type/listing_limit to arbitrary values.
-- business_type itself is already constrained by sellers_business_type_check
-- regardless of role, so no extra handling is needed for "invalid" values here.
-- Additive/backward-compatible: server routes using service_role are unaffected.

create or replace function protect_seller_plan_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.role() is distinct from 'service_role' then
    if tg_op = 'INSERT' then
      new.plan_type := 'free';
      new.listing_limit := 5;
    else
      new.business_type := old.business_type;
      new.plan_type := old.plan_type;
      new.listing_limit := old.listing_limit;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_seller_plan_fields_before_update on sellers;
drop trigger if exists protect_seller_plan_fields_before_insert_update on sellers;

create trigger protect_seller_plan_fields_before_insert_update
  before insert or update on sellers
  for each row
  execute function protect_seller_plan_fields();

revoke execute on function protect_seller_plan_fields() from anon, authenticated;
