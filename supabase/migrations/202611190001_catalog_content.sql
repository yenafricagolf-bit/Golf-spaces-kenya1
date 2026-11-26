-- Align live Supabase content with the approved local catalogue.
-- Prices remain null until commercial pricing is confirmed.
alter table public.launch_tiers
  add column if not exists image_path text
    check(image_path is null or (char_length(image_path) between 1 and 500 and image_path !~ '(^/|\.\.|://)'));

alter table public.launch_tier_units
  add column if not exists feature_summary text
    check(feature_summary is null or char_length(feature_summary) between 1 and 1600),
  add column if not exists image_path text
    check(image_path is null or (char_length(image_path) between 1 and 500 and image_path !~ '(^/|\.\.|://)'));

update public.spaces
set
  spec = jsonb_set(
    jsonb_set(spec, '{alt}', '"Outdoor covered hitting bays with three enclosed golf practice stations"'::jsonb),
    '{variants}', '[480]'::jsonb
  ),
  image_path = 'hitting-nets.jpg'
where slug = 'hitting-nets';

insert into public.launch_tiers(id,name,level,fit_description,sort_order,published,image_path) values
('20000000-0000-4000-8000-000000000001','Practice','PRACTICE TIER','Straightforward feedback for regular practice, range sessions and building a repeatable swing routine.',0,true,null),
('20000000-0000-4000-8000-000000000002','Performance','PERFORMANCE TIER','A deeper set of ball and club data for golfers who want serious practice feedback and simulator flexibility.',1,true,null),
('20000000-0000-4000-8000-000000000003','Professional','PROFESSIONAL TIER','High-resolution tracking for advanced fitting, coaching, putting analysis and premium simulator builds.',2,true,null)
on conflict(id) do update set
  name=excluded.name,
  level=excluded.level,
  fit_description=excluded.fit_description,
  sort_order=excluded.sort_order,
  published=excluded.published,
  image_path=excluded.image_path;

insert into public.launch_tier_units(id,tier_id,unit_name,indicative_price_usd,published,feature_summary,image_path) values
('21000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Swing Caddie SC200 Plus+',null,true,'Doppler radar for carry distance, swing speed, ball speed and smash factor, plus Practice Swing Mode and up to 20 hours of battery life.','monitor-portable.jpg'),
('21000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','Garmin Approach R10',null,true,'Portable radar with club and ball metrics, Garmin Golf app support, third-party simulator compatibility and up to 10 hours of battery life.','monitor-9.jpg'),
('21000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000001','SkyTrak+',null,true,'Dual Doppler radar and photometric camera system with indoor/outdoor use, ball and club data, Wi-Fi and Direct Modes.','monitor-8.jpg'),
('22000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','Foresight GC3',null,true,'Three precision cameras, touchscreen display, full ball and club data, indoor/outdoor use and simulation-ready connectivity.','monitor-16.jpg'),
('22000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','Garmin Approach R50',null,true,'Three high-speed cameras, a 10-inch colour touchscreen, 15+ ball and club measurements, impact video and built-in simulator access.','monitor-12.jpg'),
('22000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','Bushnell Launch Pro',null,true,'Three-camera infrared measurement with ball data, optional club data, touchscreen display and 5–7 hours of battery life.','monitor-11.jpg'),
('23000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003','Foresight GCQuad',null,true,'Four high-speed cameras with ball and club data, loft/lie and impact location, putting analysis and a swappable battery.','monitor-14.jpg'),
('23000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003','TrackMan 4',null,true,'Optically enhanced radar with synchronized high-speed optics, full club, ball and putting data, and simulator support.','monitor-15.jpg'),
('23000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003','Foresight Falcon',null,true,'Overhead Quadrascopic camera system measuring ball speed, launch and side angle, spin, carry, club speed, path, angle of attack, face angle, loft, lie, impact location and closure rate. The 59 × 28 in hitting zone supports left- and right-handed play, with Ethernet, USB-C and Wi-Fi connectivity, integrated power and an automatic latching ceiling mount.','foresight-falcon.jpg')
on conflict(id) do update set
  tier_id=excluded.tier_id,
  unit_name=excluded.unit_name,
  indicative_price_usd=excluded.indicative_price_usd,
  published=excluded.published,
  feature_summary=excluded.feature_summary,
  image_path=excluded.image_path;
