-- LOKALGO SHOP - seller email migration
-- Required for auth callback routing after Google Sign-In.

alter table sellers add column if not exists email text;
