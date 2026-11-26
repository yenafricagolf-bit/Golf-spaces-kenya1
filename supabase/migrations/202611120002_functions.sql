create or replace function public.submit_quote(p_quote jsonb,p_space_ids uuid[],p_ip_hash text,p_payload_hash text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare existing public.quote_requests; q public.quote_requests; result_id uuid; cnt integer; has_surface boolean; has_sim boolean;
begin
 if array_length(p_space_ids,1) is null or array_length(p_space_ids,1) not between 1 and 7 then raise exception 'Invalid selections'; end if;
 -- Serializes retries for the same id before any rate or persistence work.
 perform pg_advisory_xact_lock(hashtextextended(p_quote->>'request_id',0));
 select * into existing from public.quote_requests where request_id=(p_quote->>'request_id')::uuid;
 if found then
  if existing.payload_hash<>p_payload_hash then raise exception 'REQUEST_CONFLICT'; end if;
  return existing.id;
 end if;
 -- Atomic per-IP hourly limit; only an HMAC hash is stored.
 delete from public.quote_rate_limits where window_start<now()-interval '2 hours';
 insert into public.quote_rate_limits(ip_hash,window_start,requests) values(p_ip_hash,now(),1)
 on conflict(ip_hash) do update set requests=case when quote_rate_limits.window_start<now()-interval '1 hour' then 1 else quote_rate_limits.requests+1 end,
 window_start=case when quote_rate_limits.window_start<now()-interval '1 hour' then now() else quote_rate_limits.window_start end returning requests into cnt;
 if cnt>10 then raise exception 'RATE_LIMITED'; end if;
 select count(*),bool_or(uses_surface),bool_or(is_simulator) into cnt,has_surface,has_sim from public.spaces where id=any(p_space_ids) and published;
 if cnt<>array_length(p_space_ids,1) then raise exception 'Invalid or unpublished selection'; end if;
 select * into q from jsonb_populate_record(null::public.quote_requests,p_quote);
 if has_surface and q.surface_choice is null then raise exception 'Surface is required'; end if;
 if not has_surface and (q.surface_choice is not null or q.cups is not null or q.approx_area_m2 is not null) then raise exception 'Unexpected surface fields'; end if;
 if not has_sim and (q.monitor_tier_id is not null or q.room_length_m is not null or q.room_width_m is not null or q.room_height_m is not null or q.bays is not null) then raise exception 'Unexpected simulator fields'; end if;
 if q.monitor_tier_id is not null and not exists(select 1 from public.launch_tiers where id=q.monitor_tier_id and published) then raise exception 'Invalid tier'; end if;
 insert into public.quote_requests(request_id,payload_hash,full_name,business_name,phone,email,property_type,location,surface_choice,approx_area_m2,cups,placement,monitor_tier_id,room_length_m,room_width_m,room_height_m,bays,main_use,budget_range,timeline,maintenance_plan,notes)
 values(q.request_id,p_payload_hash,q.full_name,q.business_name,q.phone,q.email,q.property_type,q.location,q.surface_choice,q.approx_area_m2,q.cups,q.placement,q.monitor_tier_id,q.room_length_m,q.room_width_m,q.room_height_m,q.bays,q.main_use,q.budget_range,q.timeline,q.maintenance_plan,q.notes) returning id into result_id;
 insert into public.quote_request_spaces(quote_request_id,space_id) select result_id,unnest(p_space_ids);
 insert into public.quote_notifications(quote_request_id) values(result_id);
 return result_id;
end;$$;
revoke all on function public.submit_quote(jsonb,uuid[],text,text) from public,anon,authenticated;
grant execute on function public.submit_quote(jsonb,uuid[],text,text) to service_role;

create or replace function public.claim_quote_notifications(p_id uuid default null)
returns table(quote_request_id uuid) language sql security definer set search_path=public,pg_temp as $$
 update public.quote_notifications n set locked_until=now()+interval '5 minutes',attempts=n.attempts+1
 where n.quote_request_id in (
  select q.quote_request_id from public.quote_notifications q where q.sent_at is null and q.next_attempt_at<=now() and (q.locked_until is null or q.locked_until<now()) and (p_id is null or q.quote_request_id=p_id)
  order by q.next_attempt_at limit 10 for update skip locked
 ) returning n.quote_request_id;
$$;
revoke all on function public.claim_quote_notifications(uuid) from public,anon,authenticated;
grant execute on function public.claim_quote_notifications(uuid) to service_role;
