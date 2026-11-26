export const ROOM_MINIMUM = { length: 5, width: 3.5, height: 2.8 } as const;
export function checkRoomFit(length: number, width: number, height: number) {
  if (![length, width, height].every((n) => Number.isFinite(n) && n > 0))
    return { valid: false, fits: false, shortfalls: [] as string[] };
  const shortfalls = Object.entries({ length, width, height })
    .filter(([key, value]) => value < ROOM_MINIMUM[key as keyof typeof ROOM_MINIMUM])
    .map(([key]) => key);
  return { valid: true, fits: shortfalls.length === 0, shortfalls };
}
