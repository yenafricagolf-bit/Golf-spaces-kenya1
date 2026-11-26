import type { Config } from '@netlify/functions';
import { getServer, flushNotifications } from '../lib/server';
export default async () => {
  await flushNotifications(getServer());
  return new Response(null, { status: 204 });
};
export const config: Config = { schedule: '*/15 * * * *' };
