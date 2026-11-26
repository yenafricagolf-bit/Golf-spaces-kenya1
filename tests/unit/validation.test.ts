import { describe, it, expect } from 'vitest';
import { validateQuote } from '../../src/lib/validation';
import { checkRoomFit } from '../../src/lib/room-fit';
import { localCatalog } from '../../src/lib/catalog';
import { baseQuote } from '../fixture';

const parse = (changes: Record<string, unknown> = {}) =>
  validateQuote({ ...baseQuote, ...changes }, localCatalog.spaces, []);
describe('server quote validation', () => {
  it('accepts a minimal green enquiry', () => expect(parse().success).toBe(true));
  it.each([
    { full_name: ' ' },
    { phone: 'call me' },
    { email: 'not-an-email' },
    { space_ids: [] },
    { space_ids: [baseQuote.space_ids[0], baseQuote.space_ids[0]] },
    { space_ids: ['20000000-0000-4000-8000-000000000999'] },
    { surface_choice: null },
    { consent: false },
    { website: 'spam' },
    { notes: 'a'.repeat(3001) },
    { status: 'closed' },
    { approx_area_m2: -1 },
    { cups: 2.5 },
    { monitor_tier_id: '20000000-0000-4000-8000-000000000999' },
  ])('rejects invalid or forged fields: %o', (input) => expect(parse(input).success).toBe(false));
  it('requires all dimensions when one is supplied', () =>
    expect(
      parse({
        space_ids: ['10000000-0000-4000-8000-000000000004'],
        surface_choice: null,
        room_length_m: 5,
      }).success,
    ).toBe(false));
  it('permits below-guide simulator dimensions for a site review', () =>
    expect(
      parse({
        space_ids: ['10000000-0000-4000-8000-000000000004'],
        surface_choice: null,
        room_length_m: 4,
        room_width_m: 3,
        room_height_m: 2.5,
      }).success,
    ).toBe(true));
  it('rejects stale hidden fields', () =>
    expect(
      parse({
        space_ids: ['10000000-0000-4000-8000-000000000006'],
        surface_choice: 'Natural grass',
      }).success,
    ).toBe(false));
});
describe('room fit', () => {
  it('accepts exact boundary', () => expect(checkRoomFit(5, 3.5, 2.8).fits).toBe(true));
  it('reports individual shortfalls', () =>
    expect(checkRoomFit(4.99, 3.49, 2.79).shortfalls).toEqual(['length', 'width', 'height']));
  it.each([0, -1, NaN, Infinity])('rejects invalid dimension %s', (value) =>
    expect(checkRoomFit(value, 4, 3).valid).toBe(false),
  );
  it('does not silently rotate a room', () => expect(checkRoomFit(3.5, 5, 2.8).fits).toBe(false));
});
