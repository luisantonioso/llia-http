// Utility: Build header dictionary from various sources
export function assembleHeaders(
  baseHeaders: Record<string, string>,
  additionalHeaders?: HeadersInit,
): Record<string, string> {
  const combined = { ...baseHeaders };

  if (!additionalHeaders) {
    return combined;
  }

  if (additionalHeaders instanceof Headers) {
    additionalHeaders.forEach((val, key) => {
      combined[key] = val;
    });
  } else if (Array.isArray(additionalHeaders)) {
    for (const [key, val] of additionalHeaders) {
      combined[key] = val;
    }
  } else {
    Object.assign(combined, additionalHeaders);
  }

  return combined;
}

// Utility: Convert headers record to Headers object
export function toHeadersObject(headerDict: Record<string, string>): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(headerDict)) {
    headers.set(key, value);
  }
  return headers;
}

// Utility: Extract headers from Response
export function extractHeadersDict(
  response: globalThis.Response,
): Record<string, string> {
  const dict: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    dict[key] = value;
  });
  return dict;
}
