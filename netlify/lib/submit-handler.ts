import { createHash } from 'node:crypto';
import {
  errorFields,
  validateQuote,
  type QuoteInput,
  type SpaceFlags,
} from '../../src/lib/validation';
export interface QuoteDependencies {
  catalog: () => Promise<{ spaces: SpaceFlags[]; tierIds: string[] }>;
  save: (quote: QuoteInput, payloadHash: string) => Promise<string>;
  notify: (id: string) => Promise<void>;
  allowedOrigins: string[];
}
function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}
async function readBounded(request: Request): Promise<string> {
  if (Number(request.headers.get('content-length')) > 24000) throw new Error('BODY_TOO_LARGE');
  const reader = request.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let length = 0,
    result = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 24000) {
        await reader.cancel();
        throw new Error('BODY_TOO_LARGE');
      }
      result += decoder.decode(value, { stream: true });
    }
    return result + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}
export async function handleQuote(request: Request, deps: QuoteDependencies): Promise<Response> {
  if (request.method !== 'POST') return json({ message: 'Use POST to send a quote request.' }, 405);
  const origin = request.headers.get('origin');
  if (origin && !deps.allowedOrigins.includes(origin))
    return json({ message: 'This request must come from our website.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json'))
    return json({ message: 'Please send a JSON request.' }, 415);
  let raw: unknown;
  try {
    raw = JSON.parse(await readBounded(request));
  } catch (error) {
    return json(
      {
        message:
          error instanceof Error && error.message === 'BODY_TOO_LARGE'
            ? 'Your request is too large. Please shorten your notes.'
            : 'Your request could not be read. Please try again.',
      },
      error instanceof Error && error.message === 'BODY_TOO_LARGE' ? 413 : 400,
    );
  }
  try {
    const catalog = await deps.catalog();
    const parsed = validateQuote(raw, catalog.spaces, catalog.tierIds);
    if (!parsed.success)
      return json(
        { message: 'Please check the highlighted fields.', errors: errorFields(parsed.error) },
        422,
      );
    const hash = createHash('sha256').update(JSON.stringify(parsed.data)).digest('hex');
    const id = await deps.save(parsed.data, hash);
    // Persistence is the success boundary. An outbox retries failed notifications.
    try {
      await deps.notify(id);
    } catch {
      console.error('Quote saved; notification pending in outbox.', id);
    }
    return json({ id }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('RATE_LIMITED'))
      return json({ message: 'You’ve sent several requests. Please try again in an hour.' }, 429);
    if (message.includes('REQUEST_CONFLICT'))
      return json(
        {
          message:
            'This request has already been saved with different details. Reload the page to start a new request.',
        },
        409,
      );
    console.error('Quote persistence failed.');
    return json(
      {
        message:
          'We couldn’t save your request right now. Your details are still here; please try again.',
      },
      503,
    );
  }
}
