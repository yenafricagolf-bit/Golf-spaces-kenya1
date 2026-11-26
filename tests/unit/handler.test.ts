import { describe, it, expect, vi } from 'vitest';
import { handleQuote, type QuoteDependencies } from '../../netlify/lib/submit-handler';
import { localCatalog } from '../../src/lib/catalog';
import { baseQuote } from '../fixture';
const id = '30000000-0000-4000-8000-000000000001';
function dependencies(): QuoteDependencies {
  return {
    allowedOrigins: ['https://golf-spaces.test'],
    catalog: async () => ({ spaces: localCatalog.spaces, tierIds: [] }),
    save: vi.fn(async () => id),
    notify: vi.fn(async () => {}),
  };
}
function request(body: unknown = baseQuote, origin = 'https://golf-spaces.test') {
  return new Request('https://golf-spaces.test/.netlify/functions/submit-quote', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin },
    body: JSON.stringify(body),
  });
}
describe('submission boundary', () => {
  it('persists before notification and returns reference', async () => {
    const deps = dependencies();
    const result = await handleQuote(request(), deps);
    expect(result.status).toBe(201);
    expect(await result.json()).toEqual({ id });
    expect(deps.save).toHaveBeenCalledOnce();
    expect(deps.notify).toHaveBeenCalledWith(id);
  });
  it('rejects a foreign origin before persistence', async () => {
    const deps = dependencies();
    expect((await handleQuote(request(baseQuote, 'https://other.test'), deps)).status).toBe(403);
    expect(deps.save).not.toHaveBeenCalled();
  });
  it('rejects honeypot and malformed fields without saving', async () => {
    const deps = dependencies();
    expect((await handleQuote(request({ ...baseQuote, website: 'spam' }), deps)).status).toBe(422);
    expect(deps.save).not.toHaveBeenCalled();
  });
  it('returns 413 even without a content-length header', async () =>
    expect(
      (await handleQuote(request({ ...baseQuote, notes: 'x'.repeat(25000) }), dependencies()))
        .status,
    ).toBe(413));
  it('never reports success after persistence failure', async () => {
    const deps = dependencies();
    deps.save = async () => {
      throw new Error('database unavailable');
    };
    expect((await handleQuote(request(), deps)).status).toBe(503);
    expect(deps.notify).not.toHaveBeenCalled();
  });
  it('preserves successful persistence when email is deferred', async () => {
    const deps = dependencies();
    deps.notify = async () => {
      throw new Error('mail timeout');
    };
    expect((await handleQuote(request(), deps)).status).toBe(201);
  });
  it('surfaces durable rate limit', async () => {
    const deps = dependencies();
    deps.save = async () => {
      throw new Error('RATE_LIMITED');
    };
    expect((await handleQuote(request(), deps)).status).toBe(429);
  });
});
