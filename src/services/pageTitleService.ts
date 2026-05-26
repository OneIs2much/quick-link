const FETCH_TIMEOUT_MS = 5000;

/**
 * Fetches the HTML <title> of a given URL.
 * Returns undefined on any failure (network error, timeout, CORS, non-HTML).
 */
export async function fetchPageTitle(url: string): Promise<string | undefined> {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    new URL(normalized); // validate — throws if malformed

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(normalized, {
        signal: controller.signal,
        headers: { Accept: 'text/html' },
      });
    } finally {
      clearTimeout(timer);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) return undefined;

    // Read only the first 4 KB — <title> is always in <head>
    const reader = response.body?.getReader();
    if (!reader) return undefined;

    let html = '';
    while (html.length < 4096) {
      const { done, value } = await reader.read();
      if (done) break;
      html += new TextDecoder().decode(value);
    }
    reader.cancel();

    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!match) return undefined;

    return match[1].trim().replace(/\s+/g, ' ') || undefined;
  } catch {
    return undefined;
  }
}
