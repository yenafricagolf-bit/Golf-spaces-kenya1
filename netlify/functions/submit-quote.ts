import { createHmac } from 'node:crypto';
import type { Config, Context } from '@netlify/functions';
import { z } from 'zod';
import { handleQuote } from '../lib/submit-handler';
import { getServer, flushNotifications } from '../lib/server';
export default async (request: Request, context: Context) => {
  let server: ReturnType<typeof getServer>;
  try {
    server = getServer();
  } catch (error) {
    console.error(
      'Quote server configuration invalid.',
      error instanceof z.ZodError
        ? { variables: error.issues.map((issue) => String(issue.path[0] ?? 'unknown')) }
        : {
            type: error instanceof Error ? error.name : 'unknown',
            message: error instanceof Error ? error.message : 'Unknown configuration error',
          },
    );
    return Response.json(
      { message: 'Quote requests are temporarily unavailable. Please try again shortly.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  const { db, env } = server;
  return handleQuote(request, {
    allowedOrigins: [
      new URL(env.SITE_URL).origin,
      ...(process.env.DEPLOY_PRIME_URL ? [new URL(process.env.DEPLOY_PRIME_URL).origin] : []),
    ],
    catalog: async () => {
      const [s, t] = await Promise.all([
        db.from('spaces').select('id,uses_surface,is_simulator').eq('published', true),
        db.from('launch_tiers').select('id').eq('published', true),
      ]);
      if (s.error || t.error) {
        console.error('Quote catalogue query failed.', {
          spaces: s.error
            ? {
                name: s.error.name ?? null,
                code: s.error.code ?? null,
                message: s.error.message ?? null,
                details: s.error.details ?? null,
                hint: s.error.hint ?? null,
              }
            : null,
          tiers: t.error
            ? {
                name: t.error.name ?? null,
                code: t.error.code ?? null,
                message: t.error.message ?? null,
                details: t.error.details ?? null,
                hint: t.error.hint ?? null,
              }
            : null,
        });
        throw new Error('Catalogue unavailable.');
      }
      return {
        spaces: z
          .array(z.object({ id: z.uuid(), uses_surface: z.boolean(), is_simulator: z.boolean() }))
          .parse(s.data),
        tierIds: z
          .array(z.object({ id: z.uuid() }))
          .parse(t.data)
          .map((v) => v.id),
      };
    },
    save: async (quote, hash) => {
      const ipHash = createHmac('sha256', env.SUPABASE_SERVICE_ROLE_KEY)
        .update(context.ip || 'unknown')
        .digest('hex');
      const { space_ids, website, consent, ...fields } = quote;
      void website;
      void consent;
      const result = await db.rpc('submit_quote', {
        p_quote: fields,
        p_space_ids: space_ids,
        p_ip_hash: ipHash,
        p_payload_hash: hash,
      });
      if (result.error) {
        console.error('submit_quote RPC failed.', {
          code: result.error.code ?? null,
          message: result.error.message ?? null,
          details: result.error.details ?? null,
          hint: result.error.hint ?? null,
        });
        throw new Error(result.error.message);
      }
      return z.uuid().parse(result.data);
    },
    notify: async (id) => {
      await flushNotifications(server, id);
    },
  });
};
export const config: Config = {
  rateLimit: { windowSize: 60, windowLimit: 5, aggregateBy: 'ip', action: 'rate_limit' },
};
