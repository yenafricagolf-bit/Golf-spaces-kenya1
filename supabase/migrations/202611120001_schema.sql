-- All schema changes are migration-owned. No anonymous quote access.
create extension if not exists pgcrypto;
create table public.spaces (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null check(char_length(slug) between 1 and 80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check(char_length(name) between 1 and 120),
 tag text not null check(char_length(tag) between 1 and 100),
 description text not null check(char_length(description) between 1 and 1200),
 spec jsonb not null default '{}' check(jsonb_typeof(spec)='object' and octet_length(spec::text)<=12000),
 image_path text check(char_length(image_path) between 1 and 500 and image_path !~ '(^/|\.\.|://)'),
 uses_surface boolean not null default false, is_simulator boolean not null default false,
 sort_order integer not null default 0 check(sort_order between 0 and 10000),published boolean not null default false
);
create table public.launch_tiers (
 id uuid primary key default gen_random_uuid(),name text not null check(char_length(name) between 1 and 120),
 level text not null check(char_length(level) between 1 and 60),fit_description text not null check(char_length(fit_description) between 1 and 1200),
 sort_order integer not null default 0 check(sort_order between 0 and 10000),published boolean not null default false
);
create table public.launch_tier_units (
 id uuid primary key default gen_random_uuid(),tier_id uuid not null references public.launch_tiers(id) on delete cascade,
 unit_name text not null check(char_length(unit_name) between 1 and 160),
 indicative_price_usd numeric(12,2) check(indicative_price_usd>0 and indicative_price_usd<=10000000),published boolean not null default false
);
create index on public.launch_tier_units(tier_id);
create table public.quote_requests (
 id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),
 request_id uuid not null unique,payload_hash text not null check(payload_hash ~ '^[a-f0-9]{64}$'),
 full_name text not null check(char_length(full_name) between 2 and 120),business_name text not null default '' check(char_length(business_name)<=160),
 phone text not null check(char_length(phone) between 7 and 32 and phone ~ '^\+?[0-9 ()-]+$'),
 email text not null check(char_length(email) between 3 and 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 property_type text not null check(property_type in ('Home','Restaurant','Hotel','Resort','Ranch','Office','Other')),
 location text not null check(char_length(location) between 2 and 200),
 surface_choice text check(surface_choice in ('Natural grass','Synthetic turf','Advise me')),
 approx_area_m2 numeric check(approx_area_m2>0 and approx_area_m2<=1000000),cups integer check(cups between 1 and 100),
 placement text check(placement in ('Indoor','Outdoor','Both','Advise me')),
 monitor_tier_id uuid references public.launch_tiers(id),
 room_length_m numeric check(room_length_m>0 and room_length_m<=1000),room_width_m numeric check(room_width_m>0 and room_width_m<=1000),room_height_m numeric check(room_height_m>0 and room_height_m<=100),
 bays integer check(bays between 1 and 100),main_use text check(main_use in ('Personal practice','Family & guests','Coaching','Commercial use','Advise me')),
 budget_range text not null default '' check(char_length(budget_range)<=120),timeline text not null default '' check(char_length(timeline)<=120),
 maintenance_plan boolean not null default false,notes text not null default '' check(char_length(notes)<=3000),
 status text not null default 'new' check(status in ('new','contacted','quoted','closed')),
 constraint complete_room_dimensions check((room_length_m is null and room_width_m is null and room_height_m is null) or (room_length_m is not null and room_width_m is not null and room_height_m is not null))
);
create table public.quote_request_spaces (
 quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
 space_id uuid not null references public.spaces(id),primary key(quote_request_id,space_id)
);
create index on public.quote_request_spaces(space_id);
-- Durable notification outbox. Entries are created in the same transaction as the quote.
create table public.quote_notifications (
 quote_request_id uuid primary key references public.quote_requests(id) on delete cascade,
 sent_at timestamptz,attempts integer not null default 0 check(attempts>=0),
 next_attempt_at timestamptz not null default now(),locked_until timestamptz,
 last_error text check(char_length(last_error)<=200)
);
create table public.quote_rate_limits (
 ip_hash text primary key check(ip_hash ~ '^[a-f0-9]{64}$'),window_start timestamptz not null,requests integer not null check(requests>0)
);
alter table public.spaces enable row level security;
alter table public.launch_tiers enable row level security;
alter table public.launch_tier_units enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_request_spaces enable row level security;
alter table public.quote_notifications enable row level security;
alter table public.quote_rate_limits enable row level security;
revoke all on public.spaces,public.launch_tiers,public.launch_tier_units,public.quote_requests,public.quote_request_spaces,public.quote_notifications,public.quote_rate_limits from anon,authenticated;
grant select on public.spaces,public.launch_tiers,public.launch_tier_units to anon,authenticated;
grant all on public.spaces,public.launch_tiers,public.launch_tier_units,public.quote_requests,public.quote_request_spaces,public.quote_notifications,public.quote_rate_limits to service_role;
create policy published_spaces on public.spaces for select to anon,authenticated using(published);
create policy published_tiers on public.launch_tiers for select to anon,authenticated using(published);
create policy published_units on public.launch_tier_units for select to anon,authenticated using(published and exists(select 1 from public.launch_tiers t where t.id=tier_id and t.published));
-- No anon/authenticated policies on private tables. Service role is server-only.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('product-images','product-images',true,10485760,array['image/jpeg','image/png','image/webp'])
 on conflict(id) do update set public=true,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
-- Public bucket supplies reads. No public upload/update/delete policy is created.
