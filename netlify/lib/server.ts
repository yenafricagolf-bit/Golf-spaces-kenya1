import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
const environment = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  QUOTE_NOTIFY_FROM: z.string().min(3),
  QUOTE_NOTIFY_TO: z.email(),
  SITE_URL: z.url(),
});
export function getServer() {
  const env = environment.parse(process.env);
  return {
    env,
    db: createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}
export type Server = ReturnType<typeof getServer>;
const quoteNotification = z.object({
  id: z.uuid(),
  full_name: z.string(),
  business_name: z.string(),
  email: z.string(),
  phone: z.string(),
  property_type: z.string(),
  location: z.string(),
  surface_choice: z.string().nullable(),
  approx_area_m2: z.number().nullable(),
  cups: z.number().nullable(),
  placement: z.string().nullable(),
  monitor_tier_id: z.string().nullable(),
  room_length_m: z.number().nullable(),
  room_width_m: z.number().nullable(),
  room_height_m: z.number().nullable(),
  bays: z.number().nullable(),
  main_use: z.string().nullable(),
  budget_range: z.string(),
  timeline: z.string(),
  maintenance_plan: z.boolean(),
  notes: z.string(),
});
export async function flushNotifications(server: Server, id?: string) {
  const { db, env } = server;
  const claimed = await db.rpc('claim_quote_notifications', { p_id: id ?? null });
  if (claimed.error) throw new Error('Unable to claim notifications.');
  const claims = z.array(z.object({ quote_request_id: z.uuid() })).parse(claimed.data);
  for (const claim of claims) {
    try {
      const [record, selections] = await Promise.all([
        db.from('quote_requests').select('*').eq('id', claim.quote_request_id).single(),
        db
          .from('quote_request_spaces')
          .select('spaces(name)')
          .eq('quote_request_id', claim.quote_request_id),
      ]);
      if (record.error || selections.error) throw new Error('Quote read failed.');
      const q = quoteNotification.parse(record.data);
      const names = z
        .array(z.object({ spaces: z.object({ name: z.string() }) }))
        .parse(selections.data)
        .map((s) => s.spaces.name);
      let tierName = 'Advise me';
      if (q.monitor_tier_id) {
        const t = await db.from('launch_tiers').select('name').eq('id', q.monitor_tier_id).single();
        if (t.error) throw new Error('Tier read failed.');
        tierName = z.object({ name: z.string() }).parse(t.data).name;
      }
      const text = [
        `New Golf Spaces Kenya quote request`,
        `Reference: ${q.id}`,
        `Name: ${q.full_name}`,
        `Business: ${q.business_name || 'Not supplied'}`,
        `Email: ${q.email}`,
        `Phone: ${q.phone}`,
        `Property: ${q.property_type}`,
        `Location: ${q.location}`,
        `Spaces: ${names.join(', ')}`,
        `Surface: ${q.surface_choice ?? 'Not applicable'}`,
        `Area: ${q.approx_area_m2 ?? 'Not supplied'} m²`,
        `Cups: ${q.cups ?? 'Not supplied'}`,
        `Placement: ${q.placement ?? 'Not supplied'}`,
        `Monitor tier: ${tierName}`,
        `Room dimensions: ${q.room_length_m ?? '—'} × ${q.room_width_m ?? '—'} × ${q.room_height_m ?? '—'} m`,
        `Bays: ${q.bays ?? 'Not supplied'}`,
        `Use: ${q.main_use ?? 'Not supplied'}`,
        `Budget: ${q.budget_range || 'Not supplied'}`,
        `Timeline: ${q.timeline || 'Not supplied'}`,
        `Maintenance advice: ${q.maintenance_plan ? 'Yes' : 'No'}`,
        `Notes: ${q.notes || 'None'}`,
      ].join('\n');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `golf-quote-${q.id}`,
        },
        body: JSON.stringify({
          from: env.QUOTE_NOTIFY_FROM,
          to: [env.QUOTE_NOTIFY_TO],
          reply_to: q.email,
          subject: 'New Golf Spaces Kenya quote request',
          text,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`Email provider returned ${response.status}.`);
      const updated = await db
        .from('quote_notifications')
        .update({ sent_at: new Date().toISOString(), locked_until: null, last_error: null })
        .eq('quote_request_id', q.id);
      if (updated.error) throw new Error('Notification acknowledgement failed.');
    } catch {
      const update = await db
        .from('quote_notifications')
        .update({
          locked_until: null,
          next_attempt_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          last_error: 'Notification delivery failed; retry scheduled.',
        })
        .eq('quote_request_id', claim.quote_request_id);
      if (update.error)
        console.error('Outbox reschedule failed; lock will expire.', claim.quote_request_id);
    }
  }
}
