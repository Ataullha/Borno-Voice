/**
 * Frontend speech client.
 *
 * It does NOT call Hugging Face directly: Gradio rejects cross-origin browser
 * requests, so a request from this site's own origin would be blocked. Instead
 * it calls /api/tts, which Netlify routes to netlify/functions/tts.js, and that
 * function talks to the Space server-to-server.
 *
 * The Space ID lives in the function (netlify/functions/tts.js), not here.
 */

export const SPACE_ID = 'Ataullha/Codemix_BanglaTTS_Public_Demo';

const ENDPOINT = '/api/tts';

export class TtsError extends Error {
  constructor(message: string, readonly hint?: string) {
    super(message);
    this.name = 'TtsError';
  }
}

export interface SpeechResult {
  audio: string;
  normalised: string | null;
}

/** Generate speech for a sentence. */
export async function synthesize(
  text: string,
  enableCodemix: boolean,
): Promise<SpeechResult> {
  const value = text.trim();
  if (!value) throw new TtsError('Type something first.');

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: value, enable_codemix: enableCodemix }),
    });
  } catch {
    throw new TtsError(
      'Could not reach the speech service.',
      'Check your connection and try again.',
    );
  }

  const raw = await response.text();
  let payload: { audio?: string; normalised?: string | null; error?: string; hint?: string };
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new TtsError(
      'The speech service is not responding correctly.',
      response.status === 404
        ? 'The /api/tts function is missing from this deployment. Redeploy including the netlify folder.'
        : `Unexpected reply (HTTP ${response.status}).`,
    );
  }

  if (!response.ok || !payload.audio) {
    throw new TtsError(
      payload.error || 'The speech model did not return audio.',
      payload.hint,
    );
  }

  return { audio: payload.audio, normalised: payload.normalised ?? null };
}
