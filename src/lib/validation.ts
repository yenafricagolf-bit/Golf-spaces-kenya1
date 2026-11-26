import { z } from 'zod';
export const PROPERTY_TYPES = [
  'Home',
  'Restaurant',
  'Hotel',
  'Resort',
  'Ranch',
  'Office',
  'Other',
] as const;
export const SURFACES = ['Natural grass', 'Synthetic turf', 'Advise me'] as const;
export const PLACEMENTS = ['Indoor', 'Outdoor', 'Both', 'Advise me'] as const;
export const MAIN_USES = [
  'Personal practice',
  'Family & guests',
  'Coaching',
  'Commercial use',
  'Advise me',
] as const;
const text = (max: number) => z.string().trim().max(max, `Please use ${max} characters or fewer.`);
const number = (max: number) =>
  z.number().finite().positive('Enter a value greater than zero.').max(max).nullable();
export const quoteSchema = z
  .object({
    request_id: z.string().uuid(),
    full_name: text(120).min(2, 'Please enter your full name.'),
    business_name: text(160),
    phone: text(32)
      .regex(/^\+?[0-9 ()-]{7,32}$/, 'Please enter a valid phone number.')
      .refine(
        (v) => v.replace(/\D/g, '').length >= 7 && v.replace(/\D/g, '').length <= 15,
        'Use 7–15 digits.',
      ),
    email: text(254).email('Please enter a valid email address.'),
    property_type: z.enum(PROPERTY_TYPES, { error: 'Please choose a property type.' }),
    location: text(200).min(2, 'Please enter your town or location.'),
    space_ids: z
      .array(z.string().uuid())
      .min(1, 'Choose at least one space.')
      .max(7)
      .refine((v) => new Set(v).size === v.length, 'Remove duplicate selections.'),
    surface_choice: z.enum(SURFACES).nullable(),
    approx_area_m2: number(1000000),
    cups: z.number().int().min(1).max(100).nullable(),
    placement: z.enum(PLACEMENTS).nullable(),
    monitor_tier_id: z.string().uuid().nullable(),
    room_length_m: number(1000),
    room_width_m: number(1000),
    room_height_m: number(100),
    bays: z.number().int().min(1).max(100).nullable(),
    main_use: z.enum(MAIN_USES).nullable(),
    budget_range: text(120),
    timeline: text(120),
    maintenance_plan: z.boolean(),
    notes: text(3000),
    website: z.string().max(0, 'Please leave this field empty.'),
    consent: z.literal(true, { error: 'Please agree so we can respond to your request.' }),
  })
  .strict();
export type QuoteInput = z.infer<typeof quoteSchema>;
export interface SpaceFlags {
  id: string;
  uses_surface: boolean;
  is_simulator: boolean;
}
export function validateQuote(input: unknown, spaces: SpaceFlags[], tierIds: string[]) {
  return quoteSchema
    .superRefine((v, ctx) => {
      const chosen = spaces.filter((s) => v.space_ids.includes(s.id));
      if (chosen.length !== v.space_ids.length)
        ctx.addIssue({
          code: 'custom',
          path: ['space_ids'],
          message: 'One of your selected spaces is no longer available. Refresh and choose again.',
        });
      const hasSurface = chosen.some((s) => s.uses_surface),
        hasSim = chosen.some((s) => s.is_simulator);
      if (hasSurface && !v.surface_choice)
        ctx.addIssue({
          code: 'custom',
          path: ['surface_choice'],
          message: 'Choose a surface or select Advise me.',
        });
      if (
        !hasSurface &&
        (v.surface_choice !== null || v.cups !== null || v.approx_area_m2 !== null)
      )
        ctx.addIssue({
          code: 'custom',
          path: ['surface_choice'],
          message: 'Surface details only apply to selected green spaces.',
        });
      if (
        !hasSim &&
        [v.room_length_m, v.room_width_m, v.room_height_m, v.monitor_tier_id, v.bays].some(
          (n) => n !== null,
        )
      )
        ctx.addIssue({
          code: 'custom',
          path: ['room_length_m'],
          message: 'Simulator details only apply to simulator spaces.',
        });
      const dims = [v.room_length_m, v.room_width_m, v.room_height_m];
      if (hasSim && dims.some((n) => n !== null) && dims.some((n) => n === null))
        for (const k of ['room_length_m', 'room_width_m', 'room_height_m'] as const)
          if (v[k] === null)
            ctx.addIssue({
              code: 'custom',
              path: [k],
              message: 'Enter all three dimensions, or leave all three blank.',
            });
      if (v.monitor_tier_id && !tierIds.includes(v.monitor_tier_id))
        ctx.addIssue({
          code: 'custom',
          path: ['monitor_tier_id'],
          message: 'This equipment tier is no longer available.',
        });
    })
    .safeParse(input);
}
export function errorFields(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(error.issues.map((i) => [String(i.path[0] ?? 'form'), i.message]));
}
