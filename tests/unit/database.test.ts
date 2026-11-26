import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { baseQuote } from '../fixture';
let db: PGlite;
beforeAll(async () => {
  db = new PGlite();
  // Minimal Supabase-owned role/storage scaffolding for isolated PostgreSQL tests.
  await db.exec(
    'create role anon; create role authenticated; create role service_role bypassrls; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); grant usage on schema public to anon,authenticated,service_role;',
  );
  for (const file of [
    '202611120001_schema.sql',
    '202611120002_functions.sql',
    '202611120003_seed_spaces.sql',
    '202611190001_catalog_content.sql',
  ]) {
    // gen_random_uuid is built into modern PostgreSQL; pgcrypto itself is not bundled by PGlite.
    const sql = (await readFile(`supabase/migrations/${file}`, 'utf8')).replace(
      'create extension if not exists pgcrypto;',
      '',
    );
    await db.exec(sql);
  }
});
afterAll(async () => {
  await db.close();
});
async function save(
  quote: Record<string, unknown>,
  ids: string[],
  ip = 'a'.repeat(64),
  hash = 'b'.repeat(64),
) {
  return db.query<{ id: string }>('select public.submit_quote($1::jsonb,$2::uuid[],$3,$4) as id', [
    JSON.stringify(quote),
    ids,
    ip,
    hash,
  ]);
}
describe('PostgreSQL migrations, RLS and transactions', () => {
  it('seeds exactly seven spaces and the approved launch-monitor tiers', async () => {
    expect(
      (await db.query<{ count: number }>('select count(*)::int as count from spaces')).rows[0]
        ?.count,
    ).toBe(7);
    expect(
      (await db.query<{ count: number }>('select count(*)::int as count from launch_tiers')).rows[0]
        ?.count,
    ).toBe(3);
    expect(
      (await db.query<{ count: number }>('select count(*)::int as count from launch_tier_units'))
        .rows[0]?.count,
    ).toBe(9);
    expect(
      (
        await db.query<{ image_path: string }>('select image_path from spaces where slug=$1', [
          'hitting-nets',
        ])
      ).rows[0]?.image_path,
    ).toBe('hitting-nets.jpg');
  });
  it('anon sees only published spaces and cannot read quotes or call service RPC', async () => {
    await db.exec("update spaces set published=false where slug='target-range'; set role anon;");
    try {
      expect(
        (await db.query<{ count: number }>('select count(*)::int as count from spaces')).rows[0]
          ?.count,
      ).toBe(6);
      await expect(db.query('select * from quote_requests')).rejects.toThrow(/permission denied/);
      await expect(save(baseQuote, baseQuote.space_ids)).rejects.toThrow(/permission denied/);
    } finally {
      await db.exec("reset role; update spaces set published=true where slug='target-range';");
    }
  });
  it('saves quote, selections and outbox atomically and idempotently', async () => {
    const first = await save(baseQuote, baseQuote.space_ids);
    const again = await save(baseQuote, baseQuote.space_ids);
    expect(again.rows[0]?.id).toBe(first.rows[0]?.id);
    for (const table of ['quote_requests', 'quote_request_spaces', 'quote_notifications'])
      expect(
        (await db.query<{ count: number }>(`select count(*)::int as count from ${table}`)).rows[0]
          ?.count,
      ).toBe(1);
  });
  it('does not accept changed payload under an existing request id', async () => {
    await expect(
      save(baseQuote, baseQuote.space_ids, 'a'.repeat(64), 'c'.repeat(64)),
    ).rejects.toThrow('REQUEST_CONFLICT');
  });
  it('rolls back invalid selections', async () => {
    await expect(
      save({ ...baseQuote, request_id: '20000000-0000-4000-8000-000000000002' }, [
        '10000000-0000-4000-8000-000000000999',
      ]),
    ).rejects.toThrow(/Invalid or unpublished/);
    expect(
      (await db.query<{ count: number }>('select count(*)::int as count from quote_requests'))
        .rows[0]?.count,
    ).toBe(1);
  });
  it('enforces publication of tiers and units', async () => {
    await db.exec(
      "insert into launch_tiers(id,name,level,fit_description,published) values('40000000-0000-4000-8000-000000000001','Test-only tier','Test','Test-only description',false);insert into launch_tier_units(tier_id,unit_name,published) values('40000000-0000-4000-8000-000000000001','Test-only unit',true); set role anon;",
    );
    try {
      const rows = (await db.query<{ unit_name: string }>('select * from launch_tier_units')).rows;
      expect(rows).toHaveLength(9);
      expect(rows.some((row) => row.unit_name === 'Test-only unit')).toBe(false);
    } finally {
      await db.exec('reset role;');
    }
  });
  it('outbox claims avoid concurrent double delivery', async () => {
    expect((await db.query('select * from claim_quote_notifications(null)')).rows).toHaveLength(1);
    expect((await db.query('select * from claim_quote_notifications(null)')).rows).toHaveLength(0);
  });
  it('limits an IP across persisted requests', async () => {
    for (let i = 10; i < 20; i++)
      await save(
        { ...baseQuote, request_id: `20000000-0000-4000-8000-${String(i).padStart(12, '0')}` },
        baseQuote.space_ids,
        'd'.repeat(64),
      );
    await expect(
      save(
        { ...baseQuote, request_id: '20000000-0000-4000-8000-000000000020' },
        baseQuote.space_ids,
        'd'.repeat(64),
      ),
    ).rejects.toThrow('RATE_LIMITED');
  });
});
