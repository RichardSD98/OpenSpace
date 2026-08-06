-- Lets a lister mark a listing as open to tenants splitting the rent.
-- Existing listings default to false (not shared) so nothing changes for them.
alter table public.listings
  add column if not exists shared_rent boolean not null default false;
